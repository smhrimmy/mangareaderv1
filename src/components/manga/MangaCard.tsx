import { Link } from "react-router-dom";
import { Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Manga } from "@/lib/data";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useAuth } from "@/hooks/useAuth";

interface MangaCardProps {
  manga: Manga;
  showLatestChapter?: boolean;
  showProgress?: boolean;
}

const MangaCard = ({ manga, showLatestChapter = true, showProgress = true }: MangaCardProps) => {
  const { user } = useAuth();
  const { getLastRead } = useReadingHistory();
  
  // Get reading progress for this manga
  const lastRead = user ? getLastRead(manga.id) : undefined;
  const totalChapters = parseInt(manga.latestChapter);
  const currentChapter = lastRead ? parseInt(lastRead.chapter_id.replace("ch-", "")) : 0;
  const progressPercentage = totalChapters > 0 ? Math.round((currentChapter / totalChapters) * 100) : 0;
  const hasProgress = currentChapter > 0;

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group relative block overflow-hidden rounded-lg hover-lift"
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-secondary">
        <img
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-overlay-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <Badge 
          variant={manga.status === "Ongoing" ? "default" : "secondary"}
          className="absolute top-2 left-2"
        >
          {manga.status}
        </Badge>

        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs">
          <Star className="h-3 w-3 text-warning fill-warning" />
          <span className="font-medium">{manga.rating}</span>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
          {showLatestChapter && (
            <Badge variant="outline" className="mb-2 bg-primary/20 border-primary/50">
              Ch. {manga.latestChapter}
            </Badge>
          )}
          
          {/* Reading Progress Bar */}
          {showProgress && hasProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-foreground/80 mb-1">
                <span>Ch. {currentChapter}/{totalChapters}</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {manga.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{manga.views}</span>
          </div>
          {hasProgress && (
            <span className="text-primary font-medium">
              Reading
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;
