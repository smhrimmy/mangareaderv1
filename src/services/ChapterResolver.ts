import Fuse from "fuse.js";
import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter } from "./adapters/types";

interface ChapterCacheItem {
  timestamp: number;
  mapping: { [key: string]: string }; // metadataId -> chapterSourceId
}

export class ChapterResolver {
  private cache: Map<string, ChapterCacheItem> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  constructor(private adapters: Map<string, MangaSourceAdapter>) {}

  async resolveChapters(manga: Manga, sourceId: string): Promise<Chapter[]> {
    const adapter = this.adapters.get(sourceId);
    
    // If the source itself supports chapters, just use it
    if (adapter?.supportsChapters) {
      return adapter.getChapters(manga.id);
    }

    // 1. Check cache
    const cachedId = this.getFromCache(manga.id);
    if (cachedId) {
      // Split cachedId to get source:id
      const [cachedSourceId, cachedMangaId] = cachedId.includes(":") ? cachedId.split(":") : ["mangadex", cachedId];
      const chapterAdapter = this.adapters.get(cachedSourceId);
      
      if (chapterAdapter) {
        return chapterAdapter.getChapters(cachedMangaId);
      }
    }

    // 2. Search multiple chapter sources (MangaDex, Comick)
    const sourcesToTry = ["mangadex", "comick"];
    
    for (const targetSourceId of sourcesToTry) {
      const source = this.adapters.get(targetSourceId);
      if (!source) continue;

      try {
        const results = await source.searchManga({ 
          query: manga.title, 
          limit: 5 
        });

        if (results.length === 0) continue;

        const fuse = new Fuse(results, {
          keys: ["title", "author"],
          includeScore: true,
          threshold: 0.4
        });

        const matches = fuse.search(manga.title);
        
        if (matches.length > 0) {
          const bestMatch = matches[0].item;
          // Cache the mapping with source prefix if needed
          const cacheValue = bestMatch.id.includes(":") ? bestMatch.id : `${targetSourceId}:${bestMatch.id}`;
          this.saveToCache(manga.id, cacheValue);
          
          return source.getChapters(bestMatch.id);
        }
      } catch (error) {
        console.error(`Error resolving chapters from ${targetSourceId}:`, error);
      }
    }

    return [];
  }

  private getFromCache(metadataId: string): string | null {
    const item = this.cache.get(metadataId);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      this.cache.delete(metadataId);
      return null;
    }
    
    return item.mapping[metadataId];
  }

  private saveToCache(metadataId: string, chapterSourceId: string) {
    this.cache.set(metadataId, {
      timestamp: Date.now(),
      mapping: { [metadataId]: chapterSourceId }
    });
  }
}
