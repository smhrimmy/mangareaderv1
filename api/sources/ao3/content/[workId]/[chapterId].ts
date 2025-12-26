import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { workId, chapterId } = req.query;
  let url = `https://archiveofourown.org/works/${workId}/chapters/${chapterId}?view_adult=true`;
  if (chapterId === '1') url = `https://archiveofourown.org/works/${workId}?view_adult=true`;

  try {
    const response = await fetch(url, {
      headers: { ...commonHeaders, "Cookie": "view_adult=true" }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const content = $("#chapters .userstuff").html() || $(".userstuff").html();
    res.send(content || "<p>Content not found</p>");
  } catch (error) {
    res.status(500).send("Error fetching content");
  }
}
