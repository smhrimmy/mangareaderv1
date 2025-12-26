import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const BASE_URL = "https://kitsu.io/api/edge";

export const KitsuAdapter: MangaSourceAdapter = {
  id: "kitsu",
  name: "Kitsu",
  isNsfw: false,
  supportsChapters: false,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    const { query = "", limit = 20, offset = 0 } = options;
    
    const params = new URLSearchParams();
    params.append("page[limit]", limit.toString());
    params.append("page[offset]", offset.toString());
    if (query) {
      params.append("filter[text]", query);
    }

    try {
      const response = await fetch(`${BASE_URL}/manga?${params.toString()}`);
      const data = await response.json();
      if (!data.data) return [];

      return data.data.map((m: any) => transformKitsuManga(m));
    } catch (error) {
      console.error("Kitsu search error:", error);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    try {
      const response = await fetch(`${BASE_URL}/manga/${id}`);
      const data = await response.json();
      if (!data.data) return null;

      return transformKitsuManga(data.data);
    } catch (error) {
      console.error("Kitsu details error:", error);
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    // Kitsu doesn't provide chapter content/reading.
    return [];
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    return [];
  }
};

const transformKitsuManga = (m: any): Manga => {
  const attrs = m.attributes;
  return {
    id: m.id,
    title: attrs.canonicalTitle || attrs.titles.en || attrs.titles.en_jp,
    cover: attrs.posterImage?.large || attrs.posterImage?.original || "",
    author: "Unknown", // Requires extra fetch to relationships/cast
    artist: "Unknown",
    status: attrs.status === "finished" ? "Completed" : "Ongoing",
    genres: [], // Requires extra fetch to categories
    rating: attrs.averageRating ? parseFloat(attrs.averageRating) / 10 : 0,
    views: "N/A",
    description: attrs.synopsis || "",
    chapters: [],
    latestChapter: attrs.chapterCount ? attrs.chapterCount.toString() : "?",
    updatedAt: new Date(attrs.updatedAt).toLocaleDateString()
  };
};
