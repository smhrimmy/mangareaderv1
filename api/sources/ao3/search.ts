import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = (req.query.q as string) || "";
  const searchUrl = query 
    ? `https://archiveofourown.org/works/search?work_search[query]=${encodeURIComponent(query)}`
    : `https://archiveofourown.org/works/search?work_search[query]=&work_search[sort_column]=hits`;

  try {
    const response = await fetch(searchUrl, {
      headers: { ...commonHeaders, "Cookie": "view_adult=true" }
    });
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const novels: any[] = [];

    $(".work.blurb").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find(".heading a").first();
      const id = titleLink.attr("href")?.split("/works/")[1] || "";
      const title = titleLink.text().trim();
      const author = $el.find(".heading a[rel='author']").text().trim() || "Anonymous";
      
      if (id) {
        novels.push({
          id: `ao3:${id}`,
          title,
          author,
          source: "ao3",
          url: `https://archiveofourown.org/works/${id}`
        });
      }
    });

    res.json(novels);
  } catch (error: any) {
    console.error("AO3 Error:", error.message);
    res.status(500).json({ error: "Failed to fetch from AO3" });
  }
}
