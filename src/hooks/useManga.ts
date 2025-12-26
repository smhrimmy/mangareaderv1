import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { mangaService } from "@/services/mangaService";
import { fetchChapterMetadata } from "@/services/mangadex"; // Keep specific metadata fetch for now or move to service

export const useMangaList = (options: { query?: string, limit?: number, sort?: any, ids?: string[], includeNsfw?: boolean, source?: string } = {}) => {
  return useInfiniteQuery({
    queryKey: ["mangaList", options],
    queryFn: ({ pageParam = 0 }) => mangaService.search({ ...options, offset: pageParam }, options.source),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const limit = options.limit || 20;
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
  });
};

export const useMangaListByIds = (ids: string[]) => {
  return useQuery({
    queryKey: ["mangaListByIds", ids],
    queryFn: () => mangaService.search({ ids, limit: ids.length }),
    enabled: ids.length > 0,
  });
};

export const useMangaDetails = (id: string, source?: string) => {
  return useQuery({
    queryKey: ["manga", id, source],
    queryFn: () => mangaService.getMangaDetails(id, source),
    enabled: !!id,
  });
};

export const useMangaChapters = (mangaId: string, limit: number = 100, source?: string) => {
  return useInfiniteQuery({
    queryKey: ["chapters", mangaId, limit, source],
    queryFn: ({ pageParam = 0 }) => mangaService.getChapters(mangaId, source), // Pagination not fully supported in service yet for all adapters, but fine for now
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    enabled: !!mangaId,
  });
};

export const useChapterPages = (chapterId: string, source?: string) => {
  return useQuery({
    queryKey: ["chapterPages", chapterId, source],
    queryFn: () => mangaService.getChapterPages(chapterId, source),
    enabled: !!chapterId,
  });
};

export const useChapterMetadata = (chapterId: string) => {
  return useQuery({
    queryKey: ["chapterMetadata", chapterId],
    queryFn: () => fetchChapterMetadata(chapterId),
    enabled: !!chapterId,
  });
};
