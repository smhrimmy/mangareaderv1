import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";
import { fetchMangaList, fetchMangaById, fetchChapters, fetchChapterPages } from "../mangadex";

export const MangaDexAdapter: MangaSourceAdapter = {
  id: "mangadex",
  name: "MangaDex",
  isNsfw: false, // MangaDex has strict filtering, we control it via params
  supportsChapters: true,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    return fetchMangaList(options);
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    return fetchMangaById(id);
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    return fetchChapters(mangaId);
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    return fetchChapterPages(chapterId);
  }
};
