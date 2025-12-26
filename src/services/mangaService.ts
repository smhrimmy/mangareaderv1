import { MangaSourceAdapter, SearchOptions } from "./adapters/types";
import { MangaDexAdapter } from "./adapters/mangadex";
import { AniListAdapter } from "./adapters/anilist";
import { KitsuAdapter } from "./adapters/kitsu";
import { NHentaiAdapter } from "./adapters/nhentai";
import { ComickAdapter } from "./adapters/comick";
import { ConsumetAdapter } from "./adapters/consumet";
import { MangaHookAdapter } from "./adapters/mangahook";
import { AO3Adapter } from "./adapters/ao3";
import { RoyalRoadAdapter } from "./adapters/royalroad";
import { ScribbleHubAdapter } from "./adapters/scribblehub";
import { FictionZoneAdapter } from "./adapters/fictionzone";
import { WebnovelAdapter } from "./adapters/webnovel";
import { Manga, Chapter } from "@/lib/data";
import { ChapterResolver } from "./ChapterResolver";

class MangaService {
  private adapters: Map<string, MangaSourceAdapter> = new Map();
  private chapterResolver: ChapterResolver;

  constructor() {
    this.registerAdapter(MangaDexAdapter);
    this.registerAdapter(AniListAdapter);
    this.registerAdapter(KitsuAdapter);
    this.registerAdapter(NHentaiAdapter);
    this.registerAdapter(ComickAdapter);
    this.registerAdapter(ConsumetAdapter);
    this.registerAdapter(MangaHookAdapter);
    this.registerAdapter(AO3Adapter);
    this.registerAdapter(RoyalRoadAdapter);
    this.registerAdapter(ScribbleHubAdapter);
    this.registerAdapter(FictionZoneAdapter);
    this.registerAdapter(WebnovelAdapter);
    this.chapterResolver = new ChapterResolver(this.adapters);
  }

  registerAdapter(adapter: MangaSourceAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id: string): MangaSourceAdapter | undefined {
    return this.adapters.get(id);
  }

  getAdapters(): MangaSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  // Unified Search
  async search(options: SearchOptions, sourceId?: string): Promise<Manga[]> {
    if (sourceId) {
      const adapter = this.getAdapter(sourceId);
      if (!adapter) throw new Error(`Source ${sourceId} not found`);
      return adapter.searchManga(options);
    }

    if (options.includeNsfw) {
      return this.getAdapter("nhentai")!.searchManga(options);
    }

    // Default to MangaDex for general reading
    return this.getAdapter("mangadex")!.searchManga(options);
  }

  async getMangaDetails(id: string, sourceId?: string): Promise<Manga | null> {
    const adapter = this.resolveAdapter(id, sourceId);
    if (!adapter) return null;
    return adapter.getMangaDetails(id);
  }

  async getChapters(mangaId: string, sourceId?: string): Promise<Chapter[]> {
    const adapter = this.resolveAdapter(mangaId, sourceId);
    if (!adapter) return [];

    if (adapter.supportsChapters) {
      return adapter.getChapters(mangaId);
    }

    const mangaDetails = await adapter.getMangaDetails(mangaId);
    if (mangaDetails) {
      return this.chapterResolver.resolveChapters(mangaDetails, adapter.id);
    }

    return [];
  }

  async getChapterPages(chapterId: string, sourceId?: string): Promise<string[]> {
    const adapter = this.resolveAdapter(chapterId, sourceId);
    if (!adapter) return [];
    return adapter.getChapterPages(chapterId);
  }

  private resolveAdapter(id: string, sourceId?: string): MangaSourceAdapter | undefined {
    if (sourceId) return this.getAdapter(sourceId);
    
    // Auto-detection heuristics
    if (id.startsWith("nhentai:")) return this.getAdapter("nhentai");
    if (id.startsWith("anilist:")) return this.getAdapter("anilist");
    if (id.startsWith("kitsu:")) return this.getAdapter("kitsu");
    if (id.startsWith("comick:")) return this.getAdapter("comick");
    // MangaHook IDs might be numeric or slug-based, hard to distinguish without prefix. 
    // We should rely on explicit source passing in UI.

    // MangaDex IDs are UUIDs
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return this.getAdapter("mangadex");
    }

    // Default to MangaDex if ambiguous for now
    return this.getAdapter("mangadex");
  }
}

export const mangaService = new MangaService();
