import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

type WatchlistStatus = "reading" | "completed" | "plan_to_read" | "on_hold" | "dropped";

interface WatchlistItem {
  id: string;
  manga_id: string;
  status: WatchlistStatus;
  added_at: string;
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    setWatchlist([]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (mangaId: string, status: WatchlistStatus = "reading") => {
    if (!user) {
      toast.error("Please login to add to watchlist");
      return;
    }
    toast.info("Watchlist feature requires backend update");
  };

  const updateStatus = async (mangaId: string, status: WatchlistStatus) => {
    if (!user) return;
  };

  const removeFromWatchlist = async (mangaId: string) => {
    if (!user) return;
  };

  const isInWatchlist = (mangaId: string): boolean => {
    return watchlist.some(w => w.manga_id === mangaId);
  };

  const getStatus = (mangaId: string): WatchlistStatus | undefined => {
    return watchlist.find(w => w.manga_id === mangaId)?.status;
  };

  const getByStatus = (status: WatchlistStatus): WatchlistItem[] => {
    return watchlist.filter(w => w.status === status);
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    updateStatus,
    removeFromWatchlist,
    isInWatchlist,
    getStatus,
    getByStatus,
    refetch: fetchWatchlist
  };
};
