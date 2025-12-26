import fetch from 'node-fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const url = `https://nhentai.net/api/gallery/${id}`;
  try {
      const response = await fetch(url, {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      res.status(200).json(data);
  } catch (e) {
      console.error("Vercel nhentai gallery error:", e);
      res.status(500).json({ error: "Failed to fetch nhentai gallery" });
  }
}
