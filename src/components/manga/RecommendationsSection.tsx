import { Link } from "react-router-dom";
import { Sparkles, TrendingUp } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationsSectionProps {
  mangaId?: string;
  title?: string;
}

const RecommendationsSection = ({ mangaId, title = "Recommended for You" }: RecommendationsSectionProps) => {
  const { recommendations, isLoading } = useRecommendations(mangaId);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">AI Powered</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.mangaId}
            to={`/manga/${rec.mangaId}`}
            className="group"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
              <img
                src={rec.manga?.cover}
                alt={rec.manga?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {rec.matchScore}%
              </div>
            </div>
            <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {rec.manga?.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {rec.reason}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;
