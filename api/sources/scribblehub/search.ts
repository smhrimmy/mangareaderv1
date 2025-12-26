import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = (req.query.q as string) || "";
  const url = query 
    ? `https://www.scribblehub.com/?s=${encodeURIComponent(query)}&post_type=fictionposts`
    : `https://www.scribblehub.com/series-ranking/`;

  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const novels: any[] = [];

    $(".search_main_box").each((_, el) => {
        const $el = $(el);
        const titleLink = $el.find(".search_title a");
        const title = titleLink.text().trim();
        const url = titleLink.attr("href") || "";
        const idMatch = url.match(/\/series\/(\d+)\//);
        const id = idMatch ? idMatch[1] : "";

        if (id) {
          novels.push({
            id: `scribblehub:${id}`,
            title,
            source: "scribblehub",
            url
          });
        }
    });

    res.json(novels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from ScribbleHub" });
  }
}
