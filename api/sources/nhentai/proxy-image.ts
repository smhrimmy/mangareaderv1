import fetch from 'node-fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("URL required");

    try {
        const response = await fetch(imageUrl, { 
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://nhentai.net/" 
            }
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (contentType) res.setHeader("Content-Type", contentType);

        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (e) {
        console.error("Vercel nhentai image proxy error:", e);
        res.status(500).send("Failed to fetch image");
    }
}
