import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("shared_lists")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (data && !error) {
      // Get profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", targetUserId)
        .single();

      const allMangaIds = Array.from(new Set(data.flatMap(list => list.manga_ids)));
      let allMangas: Manga[] = [];
      if (allMangaIds.length > 0) {
         allMangas = await fetchMangaList({ ids: allMangaIds, limit: allMangaIds.length });
      }

      const enrichedLists = data.map(list => ({
        ...list,
        mangas: list.manga_ids.map(id => allMangas.find(m => m.id === id)).filter((m): m is Manga => !!m),
        username: profile?.username || "Anonymous"
      }));

      setLists(enrichedLists);
    }
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

    const { data, error } = await supabase
      .from("shared_lists")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        is_public: isPublic,
        manga_ids: []
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create list");
      return null;
    }

    toast.success("List created!");
    fetchLists();
    return data;
  };

  const addMangaToList = async (listId: string, mangaId: string) => {
    if (!user) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    if (list.manga_ids.includes(mangaId)) {
      toast.error("Already in this list");
      return;
    }

    const { error } = await supabase
      .from("shared_lists")
      .update({ manga_ids: [...list.manga_ids, mangaId] })
      .eq("id", listId)
      .eq("user_id", user.id);

    if (!error) {
      toast.success("Added to list!");
      fetchLists();
    }
  };

  const removeMangaFromList = async (listId: string, mangaId: string) => {
    if (!user) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const { error } = await supabase
      .from("shared_lists")
      .update({ manga_ids: list.manga_ids.filter(id => id !== mangaId) })
      .eq("id", listId)
      .eq("user_id", user.id);

    if (!error) {
      toast.success("Removed from list");
      fetchLists();
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("shared_lists")
      .delete()
      .eq("id", listId)
      .eq("user_id", user.id);

    if (!error) {
      toast.success("List deleted");
      fetchLists();
    }
  };

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
