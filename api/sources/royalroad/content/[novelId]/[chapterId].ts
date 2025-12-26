import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { novelId, chapterId } = req.query;
  const url = `https://www.royalroad.com/fiction/${novelId}/chapter/${chapterId}`;

  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const content = $(".chapter-content").html();
    res.send(content || "Content not found");
  } catch (e) {
    res.status(500).send("Error fetching content");
  }
}
