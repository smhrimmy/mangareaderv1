import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const url = `https://www.scribblehub.com/series/${id}/`;
    
  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $(".fic_title").text().trim();
    const author = $(".auth_name_fic").text().trim();
    const description = $(".wi_fic_desc").text().trim();
    const tags = $(".fic_genre").map((_, t) => $(t).text().trim()).get();

    res.json({
        id: `scribblehub:${id}`,
        title,
        author,
        description,
        genres: tags,
        source: "scribblehub"
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch SH details" });
  }
}
