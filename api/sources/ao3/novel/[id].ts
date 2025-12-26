import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const url = `https://archiveofourown.org/works/${id}?view_adult=true`;

  try {
    const response = await fetch(url, {
      headers: { ...commonHeaders, "Cookie": "view_adult=true" }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("h2.title").text().trim();
    const author = $("h3.byline").text().trim();
    const summary = $(".summary blockquote").text().trim();
    const tags = $("dd.freeform.tags a").map((_, t) => $(t).text()).get();

    res.json({
      id: `ao3:${id}`,
      title,
      author,
      description: summary,
      genres: tags,
      source: "ao3"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch details" });
  }
}
