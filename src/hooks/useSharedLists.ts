import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { fetchMangaList } from "@/services/mangadex";
import { Manga } from "@/lib/data";

interface SharedList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  manga_ids: string[];
  created_at: string;
  updated_at: string;
  mangas?: Manga[];
  username?: string;
}

export const useSharedLists = (userId?: string) => {
  const { user } = useAuth();
  const [lists, setLists] = useState<SharedList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    setLists([]);
    setIsLoading(false);
  }, [user, userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (name: string, description?: string, isPublic = true) => {
    if (!user) {
      toast.error("Please login to create lists");
      return null;
    }
    toast.info("Shared Lists feature requires backend update");
    return null;
  };

  const addMangaToList = async (listId: string, mangaId: string) => {};

  const removeMangaFromList = async (listId: string, mangaId: string) => {};

  const deleteList = async (listId: string) => {};

  const shareList = async (listId: string) => {
    const url = `${window.location.origin}/list/${listId}`;
    try {
      await navigator.share({ title: "Check out my manga list!", url });
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return {
    lists,
    isLoading,
    createList,
    addMangaToList,
    removeMangaFromList,
    deleteList,
    shareList,
    refetch: fetchLists
  };
};
