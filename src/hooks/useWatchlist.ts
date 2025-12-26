import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (data && !error) {
      setWatchlist(data as WatchlistItem[]);
    }
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

    const { error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        manga_id: mangaId,
        status
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("Already in your watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
    } else {
      toast.success("Added to watchlist");
      fetchWatchlist();
    }
  };

  const updateStatus = async (mangaId: string, status: WatchlistStatus) => {
    if (!user) return;

    const { error } = await supabase
      .from("watchlist")
      .update({ status })
      .eq("user_id", user.id)
      .eq("manga_id", mangaId);

    if (!error) {
      toast.success("Status updated");
      fetchWatchlist();
    }
  };

  const removeFromWatchlist = async (mangaId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("manga_id", mangaId);

    if (!error) {
      toast.success("Removed from watchlist");
      fetchWatchlist();
    }
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
