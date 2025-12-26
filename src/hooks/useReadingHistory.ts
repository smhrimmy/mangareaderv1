import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

interface ReadingProgress {
  id: string;
  manga_id: string;
  chapter_id: string;
  page_number: number;
  total_pages: number;
  progress_percentage: number;
  completed: boolean;
  read_at: string;
}

export const useReadingHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    // Since we removed Supabase, this hook currently does nothing or could use local storage
    // For now, return empty to prevent errors
    setHistory([]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const updateProgress = async (
    mangaId: string,
    chapterId: string,
    pageNumber: number,
    totalPages: number
  ) => {
    // No-op for now
  };

  const getProgress = (mangaId: string, chapterId: string): ReadingProgress | undefined => {
    return history.find(h => h.manga_id === mangaId && h.chapter_id === chapterId);
  };

  const getLastRead = (mangaId: string): ReadingProgress | undefined => {
    return history.find(h => h.manga_id === mangaId);
  };

  const getMangaProgress = (mangaId: string): ReadingProgress[] => {
    return history.filter(h => h.manga_id === mangaId);
  };

  const isChapterRead = (mangaId: string, chapterId: string): boolean => {
    const progress = getProgress(mangaId, chapterId);
    return progress?.completed ?? false;
  };

  return {
    history,
    isLoading,
    updateProgress,
    getProgress,
    getLastRead,
    getMangaProgress,
    isChapterRead,
    refetch: fetchHistory
  };
};
