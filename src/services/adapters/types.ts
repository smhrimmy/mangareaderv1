import { Manga, Chapter } from "@/lib/data";

export interface MangaSourceAdapter {
  id: string;
  name: string;
  isNsfw: boolean;
  supportsChapters: boolean; // True if this source provides chapter content
  
  searchManga(options: SearchOptions): Promise<Manga[]>;
  getMangaDetails(id: string): Promise<Manga | null>;
  getChapters(mangaId: string): Promise<Chapter[]>;
  getChapterPages(chapterId: string): Promise<string[]>;
}

export interface SearchOptions {
  query?: string;
  limit?: number;
  offset?: number;
  ids?: string[];
  sort?: any;
  includeNsfw?: boolean;
}
