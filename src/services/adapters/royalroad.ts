import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const API_BASE = "/api/royalroad";

export const RoyalRoadAdapter: MangaSourceAdapter = {
  id: "royalroad",
  name: "Royal Road",
  isNsfw: false,
  supportsChapters: true,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    const { query = "" } = options;
    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        cover: "https://www.royalroadcdn.com/public/img/logo/rr-logo-white-small.png",
        status: "Ongoing",
        chapters: [],
        genres: ["Fantasy", "LitRPG"]
      }));
    } catch (e) {
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    const realId = id.replace("royalroad:", "");
    try {
      const response = await fetch(`${API_BASE}/novel/${realId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        ...data,
        cover: "https://www.royalroadcdn.com/public/img/logo/rr-logo-white-small.png",
        status: "Ongoing",
        chapters: []
      };
    } catch (e) {
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const realId = mangaId.replace("royalroad:", "");
    try {
      const response = await fetch(`${API_BASE}/chapters/${realId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((c: any) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        date: new Date().toISOString(),
      }));
    } catch (e) {
      return [];
    }
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    const parts = chapterId.split(":");
    // royalroad:novelId:chapterId
    if (parts.length < 3) return [];
    
    const novelId = parts[1];
    const chId = parts[2];
    
    try {
      const response = await fetch(`${API_BASE}/content/${novelId}/${chId}`);
      const text = await response.text();
      return [text];
    } catch (e) {
      return [];
    }
  }
};
