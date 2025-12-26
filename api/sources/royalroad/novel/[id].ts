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

    const title = $("h1").text().trim();
    const author = $(".author a").text().trim();
    const description = $(".description").text().trim();
    const tags = $(".tags .label").map((_, t) => $(t).text().trim()).get();

    res.json({
      id: `royalroad:${id}`,
      title,
      author,
      description,
      genres: tags,
      source: "royalroad"
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch RR details" });
  }
}
