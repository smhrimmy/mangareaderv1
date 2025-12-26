import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useReadingHistory } from "./useReadingHistory";
import { useWatchlist } from "./useWatchlist";
import { Manga } from "@/lib/data";
import { fetchMangaList } from "@/services/mangadex";

interface Recommendation {
  mangaId: string;
  reason: string;
  matchScore: number;
  manga?: Manga;
}

export const useRecommendations = (currentMangaId?: string) => {
  const { user, profile } = useAuth();
  const { history } = useReadingHistory();
  const { watchlist } = useWatchlist();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock recommendations if edge function fails or for demo
      // In a real app, we'd call the edge function
      // const { data, error: fnError } = await supabase.functions.invoke("get-recommendations", { ... });
      
      // Fallback/Demo implementation: Fetch popular manga
      const popular = await fetchMangaList({ limit: 4, sort: { followedCount: "desc" } });
      const recs = popular
        .filter(m => m.id !== currentMangaId)
        .slice(0, 4)
        .map(m => ({
          mangaId: m.id,
          reason: "Popular on MangaDex",
          matchScore: 85 + Math.floor(Math.random() * 10),
          manga: m
        }));

      setRecommendations(recs);

    } catch (err) {
      console.error("Recommendations error:", err);
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, currentMangaId]);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations
  };
};
