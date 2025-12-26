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
  const url = `https://www.webnovel.com/search?keywords=${encodeURIComponent(query)}`;
  
  try {
      const response = await fetch(url, { headers: commonHeaders });
      const html = await response.text();
      const $ = cheerio.load(html);
      const novels: any[] = [];
      
      $("li[data-bookid]").each((_, el) => {
          const $el = $(el);
          const id = $el.attr("data-bookid");
          const title = $el.find("h3 a").text().trim();
          
          if (id && title) {
              novels.push({
                  id: `webnovel:${id}`,
                  title,
                  source: "webnovel",
                  url: `https://www.webnovel.com/book/${id}`
              });
          }
      });
      
      res.json(novels);
  } catch (e) {
      res.status(500).json({ error: "Failed to fetch from Webnovel" });
  }
}
