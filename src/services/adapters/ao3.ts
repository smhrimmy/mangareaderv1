import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const API_BASE = "/api/sources/ao3";

export const AO3Adapter: MangaSourceAdapter = {
  id: "ao3",
  name: "Archive of Our Own",
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
        cover: "https://archiveofourown.org/images/ao3_logos/logo_42.png", // Placeholder
        status: "Ongoing",
        chapters: [],
        genres: ["Fanfiction"]
      }));
    } catch (e) {
      console.error("AO3 search error", e);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    const realId = id.replace("ao3:", "");
    try {
      const response = await fetch(`${API_BASE}/novel/${realId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        ...data,
        cover: "https://archiveofourown.org/images/ao3_logos/logo_42.png",
        status: "Ongoing",
        chapters: []
      };
    } catch (e) {
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const realId = mangaId.replace("ao3:", "");
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
    // For novels, we return the text content as a single "page"
    // The reader component handles text if we signal it, but currently it expects images.
    // We might need to handle this by returning a special format or updating the reader.
    // For now, let's fetch the content.
    const parts = chapterId.split(":");
    // ao3:workId:chapterId
    if (parts.length < 3) return [];
    
    const workId = parts[1];
    const chId = parts[2];
    
    try {
      const response = await fetch(`${API_BASE}/content/${workId}/${chId}`);
      const text = await response.text();
      // Return the text content as a data URL or handle in reader?
      // Since standard reader expects images, this might break.
      // But for now, we follow the interface.
      return [text]; 
    } catch (e) {
      return [];
    }
  }
};
