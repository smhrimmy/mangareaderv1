import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const url = `https://archiveofourown.org/works/${id}/navigate`;
  
  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const chapters: any[] = [];

    $("ol.chapter.index li").each((i, el) => {
      const $el = $(el);
      const link = $el.find("a");
      const title = link.text().trim();
      const chapterId = link.attr("href")?.split("/chapters/")[1] || "";
      
      if (chapterId) {
        chapters.push({
          id: `ao3:${id}:${chapterId}`,
          novelId: `ao3:${id}`,
          number: i + 1,
          title,
          url: `https://archiveofourown.org/works/${id}/chapters/${chapterId}`
        });
      }
    });

    if (chapters.length === 0) {
       chapters.push({
           id: `ao3:${id}:1`,
           novelId: `ao3:${id}`,
           number: 1,
           title: "Full Work",
           url: `https://archiveofourown.org/works/${id}`
       });
    }

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
}
