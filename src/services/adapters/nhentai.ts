import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

// Use relative path to allow Vite proxy (dev) and Vercel functions (prod) to handle it
const API_BASE = "/api/nhentai";
const IMAGE_BASE_URL = "https://i.nhentai.net/galleries";

export const NHentaiAdapter: MangaSourceAdapter = {
  id: "nhentai",
  name: "nhentai",
  isNsfw: true,
  supportsChapters: true,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    const { query = "", limit = 25, offset = 0 } = options;
    const page = Math.floor(offset / limit) + 1;
    
    // Use local proxy instead of cors-anywhere
    const url = new URL(`${window.location.origin}${API_BASE}/search`);
    if (query) url.searchParams.append("q", query);
    url.searchParams.append("page", page.toString());

    try {
      const response = await fetch(url.toString());
      if (!response.ok) return [];

      const data = await response.json();
      const results = data.result || [];
      return results.map((g: any) => transformNHentai(g));
    } catch (error) {
      console.error("nhentai search error:", error);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    const realId = id.replace("nhentai:", "");
    try {
      const response = await fetch(`${API_BASE}/gallery/${realId}`);
      if (!response.ok) return null;

      const data = await response.json();
      return transformNHentai(data);
    } catch (error) {
      console.error("nhentai details error:", error);
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const realId = mangaId.replace("nhentai:", "");
    const details = await this.getMangaDetails(realId);
    if (!details) return [];

    return [{
      id: mangaId, 
      number: 1,
      title: "Chapter 1",
      date: details.updatedAt,
      pages: [] 
    }];
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    const realId = chapterId.replace("nhentai:", "");
    try {
      const response = await fetch(`${API_BASE}/gallery/${realId}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      const mediaId = data.media_id;
      const images = data.images.pages;

      return images.map((img: any, index: number) => {
        const ext = img.t === 'j' ? 'jpg' : img.t === 'p' ? 'png' : 'gif';
        const imageUrl = `${IMAGE_BASE_URL}/${mediaId}/${index + 1}.${ext}`;
        // Proxy the image to avoid 403 Forbidden (hotlink protection)
        return `${API_BASE}/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      });
    } catch (error) {
      console.error("nhentai pages error:", error);
      return [];
    }
  }
};

const transformNHentai = (g: any): Manga => {
  const title = g.title.english || g.title.japanese || g.title.pretty;
  const mediaId = g.media_id;
  const coverExt = g.images.cover.t === 'j' ? 'jpg' : 'png';
  const coverUrl = `https://t.nhentai.net/galleries/${mediaId}/cover.${coverExt}`;
  
  // Proxy cover image too
  const cover = `${API_BASE}/proxy-image?url=${encodeURIComponent(coverUrl)}`;
  
  const tags = g.tags ? g.tags.map((t: any) => t.name) : [];
  const author = g.tags ? (g.tags.find((t: any) => t.type === "artist")?.name || "Unknown") : "Unknown";

  return {
    id: `nhentai:${g.id}`,
    title,
    cover,
    author,
    artist: author,
    status: "Completed",
    genres: tags,
    rating: 0,
    views: (g.num_pages || 0) + " pages",
    description: `Pages: ${g.num_pages} | Favorites: ${g.num_favorites}`,
    chapters: [],
    latestChapter: "1",
    updatedAt: new Date(g.upload_date * 1000).toISOString(),
    source: "nhentai"
  } as Manga;
};
