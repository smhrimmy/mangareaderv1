import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const url = `https://www.scribblehub.com/wp-admin/admin-ajax.php`;
    
  try {
    const params = new URLSearchParams();
    params.append("action", "wi_getreleases_pagination");
    params.append("pagenum", "-1");
    params.append("mypostid", id as string);

    const response = await fetch(url, { 
        method: "POST",
        body: params,
        headers: commonHeaders
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const chapters: any[] = [];

    $(".toc_w").each((_, el) => {
        const $el = $(el);
        const link = $el.find(".toc_a");
        const title = link.text().trim();
        const href = link.attr("href") || "";
        const encodedUrl = Buffer.from(href).toString('base64');
        
        chapters.push({
            id: `scribblehub:${id}:${encodedUrl}`,
            novelId: `scribblehub:${id}`,
            number: 0,
            title,
            url: href
        });
    });

    res.json(chapters.reverse().map((c, i) => ({ ...c, number: i + 1 })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch SH chapters" });
  }
}
