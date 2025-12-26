import Dexie, { Table } from 'dexie';

export interface LocalManga {
  id: string; // Unified ID (e.g., "anilist:123" or "mangadex:abc")
  title: string;
  cover: string;
  author: string;
  description: string;
  sourceMap: { [sourceId: string]: string }; // e.g. { "mangadex": "abc", "comick": "xyz" }
  lastSync: number;
}

export interface LocalChapter {
  id: string; // Unified ID
  mangaId: string;
  sourceId: string;
  sourceChapterId: string;
  number: number;
  title: string;
  language: string;
  group?: string;
  url?: string;
  updatedAt: number;
}

export interface SourceLog {
  id?: number;
  sourceId: string;
  message: string;
  level: "info" | "warn" | "error";
  timestamp: number;
}

export interface ReadingSettings {
  id: number; // usually 1 for single user local config
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  textAlign: "left" | "justify";
  theme: "light" | "sepia" | "dark";
  brightness: number;
}

class MangaDB extends Dexie {
  manga!: Table<LocalManga>;
  chapters!: Table<LocalChapter>;
  logs!: Table<SourceLog>;
  readingSettings!: Table<ReadingSettings>;

  constructor() {
    super('MangaDelightDB');
    this.version(1).stores({
      manga: 'id, title, lastSync',
      chapters: 'id, mangaId, sourceId, number',
      logs: '++id, sourceId, level, timestamp'
    });
    
    this.version(2).stores({
      readingSettings: '++id'
    });
  }
}

export const db = new MangaDB();
