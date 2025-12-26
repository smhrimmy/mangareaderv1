import { Manga, Chapter } from "@/lib/data";
import { MangaSourceAdapter, SearchOptions } from "./types";

const ANILIST_API = "https://graphql.anilist.co";

const SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int, $isAdult: Boolean) {
  Page (page: $page, perPage: $perPage) {
    media (search: $search, type: MANGA, isAdult: $isAdult, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      description
      status
      genres
      averageScore
      staff {
        edges {
          role
          node {
            name {
              full
            }
          }
        }
      }
      chapters
      updatedAt
    }
  }
}
`;

const DETAILS_QUERY = `
query ($id: Int) {
  Media (id: $id, type: MANGA) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
    }
    description
    status
    genres
    averageScore
    staff {
      edges {
        role
        node {
          name {
            full
          }
        }
      }
    }
    chapters
    updatedAt
  }
}
`;

export const AniListAdapter: MangaSourceAdapter = {
  id: "anilist",
  name: "AniList",
  isNsfw: false,
  supportsChapters: false,

  async searchManga(options: SearchOptions): Promise<Manga[]> {
    const { query, limit = 20, offset = 0, includeNsfw = false } = options;
    const page = Math.floor(offset / limit) + 1;

    try {
      const response = await fetch(ANILIST_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: {
            search: query || undefined,
            page,
            perPage: limit,
            isAdult: includeNsfw
          }
        })
      });

      const data = await response.json();
      if (!data.data?.Page?.media) return [];

      return data.data.Page.media.map((m: any) => transformAniListManga(m));
    } catch (error) {
      console.error("AniList search error:", error);
      return [];
    }
  },

  async getMangaDetails(id: string): Promise<Manga | null> {
    try {
      const response = await fetch(ANILIST_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: DETAILS_QUERY,
          variables: { id: parseInt(id) }
        })
      });

      const data = await response.json();
      if (!data.data?.Media) return null;

      return transformAniListManga(data.data.Media);
    } catch (error) {
      console.error("AniList details error:", error);
      return null;
    }
  },

  async getChapters(mangaId: string): Promise<Chapter[]> {
    // AniList doesn't provide chapter content/list usually, just count.
    // We return empty to indicate no reading capability.
    return [];
  },

  async getChapterPages(chapterId: string): Promise<string[]> {
    return [];
  }
};

const transformAniListManga = (m: any): Manga => {
  const author = m.staff?.edges.find((e: any) => e.role === "STORY")?.node?.name?.full || "Unknown";
  const artist = m.staff?.edges.find((e: any) => e.role === "ART")?.node?.name?.full || "Unknown";

  return {
    id: m.id.toString(),
    title: m.title.english || m.title.romaji || m.title.native,
    cover: m.coverImage.extraLarge || m.coverImage.large,
    author,
    artist,
    status: m.status === "FINISHED" ? "Completed" : m.status === "RELEASING" ? "Ongoing" : "Hiatus",
    genres: m.genres || [],
    rating: m.averageScore ? m.averageScore / 10 : 0,
    views: "N/A",
    description: m.description || "",
    chapters: [],
    latestChapter: m.chapters ? m.chapters.toString() : "?",
    updatedAt: new Date(m.updatedAt * 1000).toLocaleDateString()
  };
};
