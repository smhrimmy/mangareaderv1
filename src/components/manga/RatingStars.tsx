import { useState } from "react";
import { Star } from "lucide-react";
import { useRatings } from "@/hooks/useRatings";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  mangaId: string;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  interactive?: boolean;
}

const RatingStars = ({ mangaId, size = "md", showCount = true, interactive = true }: RatingStarsProps) => {
  const { user } = useAuth();
  const { userRating, averageRating, totalRatings, rateManga } = useRatings(mangaId);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const displayRating = hoverRating ?? userRating ?? averageRating;

  const handleRate = (rating: number) => {
    if (!interactive || !user) return;
    rateManga(rating);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive || !user}
            onMouseEnter={() => interactive && user && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={() => handleRate(star)}
            className={cn(
              "transition-colors",
              interactive && user && "cursor-pointer hover:scale-110",
              !interactive || !user ? "cursor-default" : ""
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                star <= displayRating
                  ? "fill-warning text-warning"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} ({totalRatings.toLocaleString()} ratings)
        </span>
      )}
    </div>
  );
};

export default RatingStars;
