import { Router } from "express";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import NodeCache from "node-cache";

export const router = Router();
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const commonHeaders = {
  "User-Agent": USER_AGENT,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

const cached = (fn: Function) => async (req: any, res: any) => {
    // Basic cache implementation
    const key = req.originalUrl;
    const cachedData = cache.get(key);
    if (cachedData) return res.json(cachedData);

    // Mock res.json to capture output
    const originalJson = res.json;
    res.json = (body: any) => {
        if (res.statusCode === 200) {
            cache.set(key, body);
        }
        return originalJson.call(res, body);
    };
    
    await fn(req, res);
};

// --- nhentai ---
router.get("/nhentai/search", cached(async (req: any, res: any) => {
    const query = req.query.q as string;
    const page = req.query.page || 1;
    const url = query
        ? `https://nhentai.net/api/galleries/search?query=${encodeURIComponent(query)}&page=${page}`
        : `https://nhentai.net/api/galleries/all?page=${page}`;

    try {
        const response = await fetch(url, { headers: commonHeaders });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error("nhentai search error:", e);
        res.status(500).json({ error: "Failed to fetch from nhentai" });
    }
}));

router.get("/nhentai/gallery/:id", cached(async (req: any, res: any) => {
    const { id } = req.params;
    const url = `https://nhentai.net/api/gallery/${id}`;
    try {
        const response = await fetch(url, { headers: commonHeaders });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error("nhentai gallery error:", e);
        res.status(500).json({ error: "Failed to fetch nhentai gallery" });
    }
}));

router.get("/nhentai/proxy-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("URL required");

    try {
        const response = await fetch(imageUrl, { 
            headers: {
                ...commonHeaders,
                "Referer": "https://nhentai.net/" 
            }
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        // Forward content type
        const contentType = response.headers.get("content-type");
        if (contentType) res.setHeader("Content-Type", contentType);

        // Pipe the image stream
        if (response.body) {
            response.body.pipe(res);
        } else {
             res.status(500).send("No image body");
        }
    } catch (e) {
        console.error("nhentai image proxy error:", e);
        res.status(500).send("Failed to fetch image");
    }
});

// Generic Proxy Route
router.get("/proxy", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("URL required");
    
    try {
        const response = await fetch(url, { headers: commonHeaders });
        const text = await response.text();
        res.send(text);
    } catch (e) {
        res.status(500).send("Proxy error");
    }
});

// --- AO3 ---
router.get("/ao3/search", cached(async (req: any, res: any) => {
  const query = (req.query.q as string) || "";
  // If no query, fetch recent/popular works? AO3 doesn't have a simple "all" API without filters.
  // We'll search for "fanfiction" or something generic if empty, or just return empty.
  // Better: use a default tag like "Anime & Manga" if empty.
  
  const searchUrl = query 
    ? `https://archiveofourown.org/works/search?work_search[query]=${encodeURIComponent(query)}`
    : `https://archiveofourown.org/works/search?work_search[query]=&work_search[sort_column]=hits`;

  try {
    const response = await fetch(searchUrl, {
      headers: { ...commonHeaders, "Cookie": "view_adult=true" }
    });
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const novels: any[] = [];

    $(".work.blurb").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find(".heading a").first();
      const id = titleLink.attr("href")?.split("/works/")[1] || "";
      const title = titleLink.text().trim();
      const author = $el.find(".heading a[rel='author']").text().trim() || "Anonymous";
      
      if (id) {
        novels.push({
          id: `ao3:${id}`,
          title,
          author,
          source: "ao3",
          url: `https://archiveofourown.org/works/${id}`
        });
      }
    });

    res.json(novels);
  } catch (error: any) {
    console.error("AO3 Error:", error.message);
    res.status(500).json({ error: "Failed to fetch from AO3" });
  }
}));

router.get("/ao3/novel/:id", async (req, res) => {
  const { id } = req.params;
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
});

router.get("/ao3/chapters/:id", async (req, res) => {
  const { id } = req.params;
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
});

router.get("/ao3/content/:workId/:chapterId", async (req, res) => {
  const { workId, chapterId } = req.params;
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
});


// --- FictionZone ---
router.get("/fictionzone/search", cached(async (req: any, res: any) => {
    const query = (req.query.q as string) || "";
    const url = `https://fictionzone.net/library?q=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url, { headers: commonHeaders });
        const html = await response.text();
        const $ = cheerio.load(html);
        const novels: any[] = [];
        
        $("a[href^='/novel/']").each((_, el) => {
             const $el = $(el);
             const href = $el.attr("href");
             if (!href || href.includes("/chapter/")) return;
             
             const img = $el.find("img");
             const title = $el.find(".title, h3, h4").text().trim() || $el.attr("title") || "";
             
             if (title) {
                 const id = href.split("/novel/")[1];
                 novels.push({
                     id: `fictionzone:${id}`,
                     title,
                     source: "fictionzone",
                     url: `https://fictionzone.net${href}`
                 });
             }
        });

        const unique = Array.from(new Map(novels.map(item => [item.id, item])).values());
        res.json(unique);
    } catch (e) {
        console.error("FictionZone error:", e);
        res.status(500).json({ error: "Failed to fetch from FictionZone" });
    }
}));

// --- Webnovel ---
router.get("/webnovel/search", cached(async (req: any, res: any) => {
    const query = (req.query.q as string) || "";
    const url = `https://www.webnovel.com/search?keywords=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url, { headers: commonHeaders });
        const html = await response.text();
        const $ = cheerio.load(html);
        const novels: any[] = [];
        
        $("li[data-bookid]").each((_, el) => {
            const $el = $(el);
            const id = $el.attr("data-bookid");
            const title = $el.find("h3 a").text().trim();
            
            if (id && title) {
                novels.push({
                    id: `webnovel:${id}`,
                    title,
                    source: "webnovel",
                    url: `https://www.webnovel.com/book/${id}`
                });
            }
        });
        
        res.json(novels);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch from Webnovel" });
    }
}));

// --- RoyalRoad ---
router.get("/royalroad/search", cached(async (req: any, res: any) => {
  const query = (req.query.q as string) || "";
  const url = query
    ? `https://www.royalroad.com/fictions/search?title=${encodeURIComponent(query)}`
    : `https://www.royalroad.com/fictions/best-rated`;

  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const novels: any[] = [];

    $(".fiction-list-item").each((_, el) => {
      const $el = $(el);
      const titleLink = $el.find(".fiction-title a");
      const id = titleLink.attr("href")?.split("/fiction/")[1]?.split("/")[0] || "";
      const title = titleLink.text().trim();
      
      if (id) {
        novels.push({
          id: `royalroad:${id}`,
          title,
          source: "royalroad",
          url: `https://www.royalroad.com/fiction/${id}`
        });
      }
    });

    res.json(novels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from RoyalRoad" });
  }
}));

router.get("/royalroad/novel/:id", async (req, res) => {
    const { id } = req.params;
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
});

router.get("/royalroad/chapters/:id", async (req, res) => {
    const { id } = req.params;
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
});

router.get("/royalroad/content/:novelId/:chapterId", async (req, res) => {
    const { novelId, chapterId } = req.params;
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
});


// --- ScribbleHub ---
router.get("/scribblehub/search", cached(async (req: any, res: any) => {
  const query = (req.query.q as string) || "";
  const url = query 
    ? `https://www.scribblehub.com/?s=${encodeURIComponent(query)}&post_type=fictionposts`
    : `https://www.scribblehub.com/series-ranking/`;

  try {
    const response = await fetch(url, { headers: commonHeaders });
    const html = await response.text();
    const $ = cheerio.load(html);
    const novels: any[] = [];

    $(".search_main_box").each((_, el) => {
        const $el = $(el);
        const titleLink = $el.find(".search_title a");
        const title = titleLink.text().trim();
        const url = titleLink.attr("href") || "";
        const idMatch = url.match(/\/series\/(\d+)\//);
        const id = idMatch ? idMatch[1] : "";

        if (id) {
          novels.push({
            id: `scribblehub:${id}`,
            title,
            source: "scribblehub",
            url
          });
        }
    });

    res.json(novels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from ScribbleHub" });
  }
}));

router.get("/scribblehub/novel/:id", async (req, res) => {
    const { id } = req.params;
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
});

router.get("/scribblehub/chapters/:id", async (req, res) => {
    const { id } = req.params;
    const url = `https://www.scribblehub.com/wp-admin/admin-ajax.php`;
    
    try {
        const params = new URLSearchParams();
        params.append("action", "wi_getreleases_pagination");
        params.append("pagenum", "-1");
        params.append("mypostid", id);

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
});

router.get("/scribblehub/content/:id/:encodedUrl", async (req, res) => {
    const { encodedUrl } = req.params;
    try {
        const url = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        const response = await fetch(url, { headers: commonHeaders });
        const html = await response.text();
        const $ = cheerio.load(html);
        const content = $(".chp_raw").html() || $(".chapter-content").html();
        res.send(content || "Content not found");
    } catch (e) {
        res.status(500).send("Error fetching content");
    }
});
