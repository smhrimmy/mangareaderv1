import { Manga, Chapter } from "@/lib/data";

const BASE_URL = "https://api.mangadex.org";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"; // Fallback if needed, but MangaDex usually supports CORS.

// Types for MangaDex API responses
interface MangaDexManga {
  id: string;
  attributes: {
    title: { en?: string; [key: string]: string | undefined };
    description: { en?: string; [key: string]: string | undefined };
    status: string;
    year: number;
    tags: { attributes: { name: { en: string } } }[];
    updatedAt: string;
  };
  relationships: { type: string; id: string; attributes?: any }[];
}

interface MangaDexChapter {
  id: string;
  attributes: {
    volume: string;
    chapter: string;
    title: string;
    publishAt: string;
  };
  relationships: { type: string; id: string }[];
}

export const fetchMangaList = async (options: { 
  query?: string, 
  limit?: number, 
  offset?: number, 
  sort?: any, 
  ids?: string[],
  includeNsfw?: boolean 
} = {}): Promise<Manga[]> => {
  const { query = "", limit = 20, offset = 0, sort, ids, includeNsfw = false } = options;
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  params.append("includes[]", "cover_art");
  params.append("includes[]", "author");
  params.append("includes[]", "artist");
  
  if (includeNsfw) {
    params.append("contentRating[]", "pornographic");
    params.append("contentRating[]", "erotica");
    params.append("contentRating[]", "suggestive");
    params.append("contentRating[]", "safe");
  } else {
    params.append("contentRating[]", "safe");
    params.append("contentRating[]", "suggestive");
    params.append("contentRating[]", "erotica");
  }

  if (query) {
    params.append("title", query);
  }

  if (ids && ids.length > 0) {
    ids.forEach(id => params.append("ids[]", id));
  }

  if (sort) {
    Object.entries(sort).forEach(([key, value]) => {
      params.append(`order[${key}]`, value as string);
    });
  }

  try {
    const response = await fetch(`${BASE_URL}/manga?${params.toString()}`);
    if (!response.ok) {
        console.error(`MangaDex API Error: ${response.status} ${response.statusText}`);
        throw new Error("Failed to fetch manga list");
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.data.length} manga from MangaDex`);
    return data.data.map((m: MangaDexManga) => transformManga(m));
  } catch (error) {
    console.error("Fetch Manga List Error:", error);
    return [];
  }
};

export const fetchMangaById = async (id: string): Promise<Manga | null> => {
  try {
    const response = await fetch(`${BASE_URL}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return transformManga(data.data);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchChapters = async (mangaId: string, limit: number = 100, offset: number = 0): Promise<Chapter[]> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    "translatedLanguage[]": "en",
    "order[chapter]": "desc",
  });

  try {
    const response = await fetch(`${BASE_URL}/manga/${mangaId}/feed?${params.toString()}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data.map((ch: MangaDexChapter) => ({
      id: ch.id,
      number: parseFloat(ch.attributes.chapter || "0"),
      title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
      date: new Date(ch.attributes.publishAt).toLocaleDateString(),
      pages: [], // Pages are fetched separately
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchChapterPages = async (chapterId: string, dataSaver: boolean = true): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/at-home/server/${chapterId}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    const baseUrl = data.baseUrl;
    const hash = data.chapter.hash;
    const mode = dataSaver ? "data-saver" : "data";
    const files = dataSaver ? data.chapter.dataSaver : data.chapter.data;

    return files.map((file: string) => `${baseUrl}/${mode}/${hash}/${file}`);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchChapterMetadata = async (chapterId: string): Promise<Chapter | null> => {
  try {
    const response = await fetch(`${BASE_URL}/chapter/${chapterId}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const ch = data.data;
    return {
      id: ch.id,
      number: parseFloat(ch.attributes.chapter || "0"),
      title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
      date: new Date(ch.attributes.publishAt).toLocaleDateString(),
      pages: [],
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Helper to transform MangaDex data to our app's format
const transformManga = (manga: MangaDexManga): Manga => {
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "Unknown Title";
  const coverRel = manga.relationships.find(r => r.type === "cover_art");
  const authorRel = manga.relationships.find(r => r.type === "author");
  const artistRel = manga.relationships.find(r => r.type === "artist");

  const coverFileName = coverRel?.attributes?.fileName;
  const cover = coverFileName 
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.256.jpg`
    : "https://via.placeholder.com/300x450?text=No+Cover";

  return {
    id: manga.id,
    title: title,
    cover: cover,
    author: authorRel?.attributes?.name || "Unknown Author",
    artist: artistRel?.attributes?.name || "Unknown Artist",
    status: (manga.attributes.status.charAt(0).toUpperCase() + manga.attributes.status.slice(1)) as "Ongoing" | "Completed" | "Hiatus",
    genres: manga.attributes.tags.map(t => t.attributes.name.en),
    rating: 0, // MangaDex doesn't give simple rating in basic response, need stats API
    views: "N/A", // Need stats API
    description: manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "",
    chapters: [], // Fetched separately
    latestChapter: "", // Calculated from chapters
    updatedAt: new Date(manga.attributes.updatedAt).toLocaleDateString(),
  };
};
