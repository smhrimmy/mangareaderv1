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
  const url = query
    ? `https://www.royalroad.com/fictions/search?title=${encodeURIComponent(query)}`
    : `https://www.royalroad.com/fictions/best-rated`;

  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const novels: any[] = [];

    $(".fiction-list-item").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find(".fiction-title a");
      const id = titleLink.attr("href")?.split("/fiction/")[1]?.split("/")[0] || "";
      const title = titleLink.text().trim();
      
      if (id) {
        novels.push({
          id: `royalroad:${id}`,
          title,
          source: "royalroad",
          url: `https://www.royalroad.com/fiction/${id}`
        });
      }
    });

    res.json(novels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from RoyalRoad" });
  }
}
