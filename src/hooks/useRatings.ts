import { useState, useEffect, useCallback } from "react";
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
    setRatings([]);
    setTotalRatings(0);
    setAverageRating(0);
    setUserRating(null);
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
    toast.info("Rating feature requires backend update");
  };

  const removeRating = async () => {};

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
