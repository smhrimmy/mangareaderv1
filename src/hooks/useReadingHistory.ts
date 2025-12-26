import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reading_history")
      .select("*")
      .eq("user_id", user.id)
      .order("read_at", { ascending: false });

    if (data && !error) {
      setHistory(data);
    }
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
    if (!user) return;

    const progressPercentage = Math.round((pageNumber / totalPages) * 100);
    const completed = pageNumber >= totalPages;

    const { error } = await supabase
      .from("reading_history")
      .upsert({
        user_id: user.id,
        manga_id: mangaId,
        chapter_id: chapterId,
        page_number: pageNumber,
        total_pages: totalPages,
        progress_percentage: progressPercentage,
        completed,
        read_at: new Date().toISOString()
      }, {
        onConflict: "user_id,manga_id,chapter_id"
      });

    if (!error) {
      fetchHistory();
    }
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
