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
  const url = `https://fictionzone.net/library?q=${encodeURIComponent(query)}`;
  
  try {
      const response = await fetch(url, { headers: commonHeaders });
      const html = await response.text();
      const $ = cheerio.load(html);
      const novels: any[] = [];
      
      $("a[href^='/novel/']").each((_, el) => {
           const $el = $(el);
           const href = $el.attr("href");
           if (!href || href.includes("/chapter/")) return;
           
           const title = $el.find(".title, h3, h4").text().trim() || $el.attr("title") || "";
           
           if (title) {
               const id = href.split("/novel/")[1];
               novels.push({
                   id: `fictionzone:${id}`,
                   title,
                   source: "fictionzone",
                   url: `https://fictionzone.net${href}`
               });
           }
      });

      const unique = Array.from(new Map(novels.map(item => [item.id, item])).values());
      res.json(unique);
  } catch (e) {
      console.error("FictionZone error:", e);
      res.status(500).json({ error: "Failed to fetch from FictionZone" });
  }
}
