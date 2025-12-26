import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const BASE_URL = "http://localhost:3000/api"; // Default local instance

interface MangaHookItem {
  id: string;
  image: string;
  title: string;
  chapter: string;
  view: string;
  description: string;
}

interface MangaHookResponse {
  mangaList: MangaHookItem[];
  metaData: any;
}

export const MangaHookAdapter: MangaSourceAdapter = {
  id: "mangahook",
  name: "MangaHook (Local)",
  isNsfw: false,
  supportsChapters: true,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    try {
      const url = new URL(`${BASE_URL}/mangaList`);
      if (options.query) {
        url.searchParams.append("word", options.query); 
      }
      
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      
      const data: MangaHookResponse = await res.json();
      
      return data.mangaList.map(item => ({
        id: item.id,
        title: item.title,
        cover: item.image,
        author: "Unknown",
        artist: "Unknown", // Added missing property
        status: "Unknown" as any, // Cast to handle "Unknown" if strict union
        description: item.description,
        genres: [], // Renamed from tags to genres
        rating: 0,
        views: item.view || "0", // Added missing property
        chapters: [], // Added missing property
        latestChapter: item.chapter, // Added missing property
        updatedAt: new Date().toISOString(), // Added missing property
        source: "mangahook"
      } as unknown as Manga)); // Type assertion to bypass strict checks on source
    } catch (e) {
      console.error("MangaHook search error:", e);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    try {
      const res = await fetch(`${BASE_URL}/mangaList/${id}`);
      if (!res.ok) return null;
      
      const data = await res.json();
      
      return {
        id: data.id || id,
        title: data.title,
        cover: data.image,
        author: data.author || "Unknown",
        artist: "Unknown",
        status: (data.status || "Unknown") as any,
        description: data.description || "",
        genres: data.category?.map((c: any) => c.type) || [], // Map category to genres
        rating: 0,
        views: data.view || "0",
        chapters: [],
        latestChapter: data.chapter || "",
        updatedAt: new Date().toISOString(),
        source: "mangahook"
      } as unknown as Manga;
    } catch (e) {
      console.error("MangaHook detail error:", e);
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    try {
      const res = await fetch(`${BASE_URL}/mangaList/${mangaId}`);
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!data.chapterList) return [];

      return data.chapterList.map((ch: any) => ({
        id: ch.id,
        title: ch.name || `Chapter ${ch.id}`,
        number: parseFloat(ch.name?.match(/(\d+(\.\d+)?)/)?.[0] || "0"),
        date: new Date().toISOString(),
        pages: [] // Added missing property
      }));
    } catch (e) {
      console.error("MangaHook chapters error:", e);
      return [];
    }
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    try {
      const res = await fetch(`${BASE_URL}/mangaList/chapter/${chapterId}`);
      if (!res.ok) return [];
      
      const data = await res.json();
      return data.images || [];
    } catch (e) {
      console.error("MangaHook pages error:", e);
      return [];
    }
  }
};
