import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const API_BASE = "/api/fictionzone";

export const FictionZoneAdapter: MangaSourceAdapter = {
  id: "fictionzone",
  name: "FictionZone",
  isNsfw: false,
  supportsChapters: false, // Incomplete implementation

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    const { query = "" } = options;
    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        cover: "https://fictionzone.net/favicon.ico",
        status: "Ongoing",
        chapters: [],
        genres: ["Web Novel"]
      }));
    } catch (e) {
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    return null;
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    return [];
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    return [];
  }
};
