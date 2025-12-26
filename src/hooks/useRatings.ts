import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Rating {
  id: string;
  user_id: string;
  manga_id: string;
  rating: number;
  created_at: string;
}

export const useRatings = (mangaId?: string) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    if (!mangaId) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("manga_ratings")
      .select("*")
      .eq("manga_id", mangaId);

    if (data && !error) {
      setRatings(data);
      setTotalRatings(data.length);
      
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      if (user) {
        const myRating = data.find(r => r.user_id === user.id);
        setUserRating(myRating?.rating ?? null);
      }
    }
    setIsLoading(false);
  }, [mangaId, user]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const rateManga = async (rating: number) => {
    if (!user) {
      toast.error("Please login to rate");
      return;
    }

    if (!mangaId) return;

    const { error } = await supabase
      .from("manga_ratings")
      .upsert({
        user_id: user.id,
        manga_id: mangaId,
        rating
      }, {
        onConflict: "user_id,manga_id"
      });

    if (error) {
      toast.error("Failed to submit rating");
    } else {
      toast.success("Rating submitted");
      fetchRatings();
    }
  };

  const removeRating = async () => {
    if (!user || !mangaId) return;

    const { error } = await supabase
      .from("manga_ratings")
      .delete()
      .eq("user_id", user.id)
      .eq("manga_id", mangaId);

    if (!error) {
      toast.success("Rating removed");
      setUserRating(null);
      fetchRatings();
    }
  };

  return {
    ratings,
    userRating,
    averageRating,
    totalRatings,
    isLoading,
    rateManga,
    removeRating,
    refetch: fetchRatings
  };
};
