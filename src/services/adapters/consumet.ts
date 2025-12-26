import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

// Using a reliable Consumet instance or fallback
const BASE_URL = "https://api.consumet.org/manga/mangadex"; 
// Note: api.consumet.org is often rate-limited. 
// Users can swap this for a self-hosted URL or RapidAPI proxy.

const RAPID_API_KEY = "b6ffc284f5mshe67374840bbf751p109827jsnac5a56bfcdd2";
const RAPID_API_HOST = "consumet.p.rapidapi.com"; // Hypothetical host if using RapidAPI

export const ConsumetAdapter: MangaSourceAdapter = {
  id: "consumet",
  name: "Consumet (MangaDex)",
  isNsfw: false,
  supportsChapters: true,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    try {
      const query = options.query || "naruto"; // Consumet requires a query often
      const url = `${BASE_URL}/${encodeURIComponent(query)}`;
      
      const headers: Record<string, string> = {};
      if (BASE_URL.includes("rapidapi")) {
        headers["X-RapidAPI-Key"] = RAPID_API_KEY;
        headers["X-RapidAPI-Host"] = RAPID_API_HOST;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) return [];

      const data = await res.json();
      // Consumet returns { results: [...] }
      const results = data.results || [];

      return results.map((item: any) => ({
        id: item.id,
        title: item.title,
        cover: item.image,
        author: "Unknown",
        artist: "Unknown", // Added missing property
        status: (item.status || "Unknown") as any,
        description: item.description?.en || item.description || "",
        genres: [], // Renamed from tags to genres
        rating: item.rating || 0,
        views: "0", // Added missing property
        chapters: [], // Added missing property
        latestChapter: "", // Added missing property
        updatedAt: new Date().toISOString(), // Added missing property
        source: "consumet"
      } as unknown as Manga));
    } catch (e) {
      console.error("Consumet search error:", e);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    try {
      const url = `${BASE_URL}/info/${id}`;
       const headers: Record<string, string> = {};
      if (BASE_URL.includes("rapidapi")) {
        headers["X-RapidAPI-Key"] = RAPID_API_KEY;
        headers["X-RapidAPI-Host"] = RAPID_API_HOST;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) return null;

      const data = await res.json();

      return {
        id: data.id,
        title: data.title,
        cover: data.image,
        author: data.author || "Unknown",
        artist: "Unknown",
        status: (data.status || "Unknown") as any,
        description: data.description?.en || data.description || "",
        genres: data.genres || [],
        rating: data.rating || 0,
        views: "0",
        chapters: [],
        latestChapter: "",
        updatedAt: new Date().toISOString(),
        source: "consumet"
      } as unknown as Manga;
    } catch (e) {
      console.error("Consumet detail error:", e);
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    try {
      const url = `${BASE_URL}/info/${mangaId}`;
       const headers: Record<string, string> = {};
      if (BASE_URL.includes("rapidapi")) {
        headers["X-RapidAPI-Key"] = RAPID_API_KEY;
        headers["X-RapidAPI-Host"] = RAPID_API_HOST;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) return [];

      const data = await res.json();
      const chapters = data.chapters || [];

      return chapters.map((ch: any) => ({
        id: ch.id,
        title: ch.title || `Chapter ${ch.chapterNumber}`,
        number: parseFloat(ch.chapterNumber) || 0,
        date: new Date().toISOString(),
        pages: [] // Added missing property
      })).reverse(); // Consumet usually returns new->old
    } catch (e) {
      console.error("Consumet chapters error:", e);
      return [];
    }
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    try {
      const url = `${BASE_URL}/read/${chapterId}`;
       const headers: Record<string, string> = {};
      if (BASE_URL.includes("rapidapi")) {
        headers["X-RapidAPI-Key"] = RAPID_API_KEY;
        headers["X-RapidAPI-Host"] = RAPID_API_HOST;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) return [];

      const data = await res.json();
      // Consumet returns array of objects { url: string, ... } or just strings depending on provider
      return data.map((p: any) => typeof p === 'string' ? p : p.img);
    } catch (e) {
      console.error("Consumet pages error:", e);
      return [];
    }
  }
};
