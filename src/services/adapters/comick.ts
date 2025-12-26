import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const COMICK_API = "https://api.comick.io"; // or comick.fun

export const ComickAdapter: MangaSourceAdapter = {
  id: "comick",
  name: "Comick",
  isNsfw: false,
  supportsChapters: true,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    const { query = "", limit = 20 } = options;
    if (!query) return [];

    try {
      const response = await fetch(`${COMICK_API}/v1.0/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();
      
      return data.map((m: any) => ({
        id: `comick:${m.hid}`,
        title: m.title,
        cover: m.md_covers ? `https://meo.comick.pictures/${m.md_covers[0].b2key}` : "",
        author: "Unknown",
        artist: "Unknown",
        status: "Unknown",
        genres: [],
        rating: m.rating || 0,
        views: "N/A",
        description: m.desc || "",
        chapters: [],
        latestChapter: "",
        updatedAt: new Date().toLocaleDateString()
      }));
    } catch (error) {
      console.error("Comick search error:", error);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    const hid = id.replace("comick:", "");
    try {
      const response = await fetch(`${COMICK_API}/comic/${hid}`);
      const data = await response.json();
      const comic = data.comic;

      return {
        id: `comick:${comic.hid}`,
        title: comic.title,
        cover: comic.md_covers ? `https://meo.comick.pictures/${comic.md_covers[0].b2key}` : "",
        author: comic.authors?.[0]?.name || "Unknown",
        artist: comic.artists?.[0]?.name || "Unknown",
        status: comic.status === 1 ? "Ongoing" : "Completed",
        genres: comic.md_comic_md_genres?.map((g: any) => g.md_genres.name) || [],
        rating: comic.rating || 0,
        views: comic.view_count?.toString() || "N/A",
        description: comic.desc || "",
        chapters: [],
        latestChapter: comic.last_chapter || "",
        updatedAt: new Date().toLocaleDateString()
      };
    } catch (error) {
      console.error("Comick details error:", error);
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const hid = mangaId.replace("comick:", "");
    try {
      // Fetch chapters with pagination if needed, here we fetch a reasonable limit
      const response = await fetch(`${COMICK_API}/comic/${hid}/chapters?lang=en&limit=300`);
      const data = await response.json();
      
      return data.chapters.map((ch: any) => ({
        id: `comick:${ch.hid}`,
        number: parseFloat(ch.chap || "0"),
        title: ch.title || `Chapter ${ch.chap}`,
        date: ch.created_at ? new Date(ch.created_at).toLocaleDateString() : "",
        pages: []
      }));
    } catch (error) {
      console.error("Comick chapters error:", error);
      return [];
    }
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    const hid = chapterId.replace("comick:", "");
    try {
      const response = await fetch(`${COMICK_API}/chapter/${hid}`);
      const data = await response.json();
      
      return data.chapter.md_images.map((img: any) => 
        `https://meo.comick.pictures/${img.b2key}`
      );
    } catch (error) {
      console.error("Comick pages error:", error);
      return [];
    }
  }
};
