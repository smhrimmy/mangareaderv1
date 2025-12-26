import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const url = `https://www.royalroad.com/fiction/${id}`;

  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const chapters: any[] = [];

    $("#chapters tbody tr").each((_, el) => {
      const $el = $(el);
      const link = $el.find("a");
      const title = link.text().trim();
      const href = link.attr("href");
      if (!href) return;
      const chapterId = href.split("/chapter/")[1]?.split("/")[0];

      if (chapterId) {
        chapters.push({
          id: `royalroad:${id}:${chapterId}`,
          novelId: `royalroad:${id}`,
          number: chapters.length + 1,
          title,
          url: `https://www.royalroad.com${href}`
        });
      }
    });
    res.json(chapters);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch RR chapters" });
  }
}
