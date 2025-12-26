import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useMangaListByIds } from "@/hooks/useManga";
import { useMemo } from "react";

export const ContinueReading = () => {
  const { user } = useAuth();
  const { history, isLoading } = useReadingHistory();

  // Get unique manga with latest progress
  const uniqueMangaHistory = useMemo(() => {
    return history.reduce((acc, item) => {
      if (!acc.find(h => h.manga_id === item.manga_id)) {
        acc.push(item);
      }
      return acc;
    }, [] as typeof history).slice(0, 6);
  }, [history]);

  const mangaIds = uniqueMangaHistory.map(h => h.manga_id);
  const { data: mangas = [], isLoading: isMangaLoading } = useMangaListByIds(mangaIds);

  if (!user || isLoading || isMangaLoading) return null;

  // Get recently read manga with progress
  const recentlyRead = uniqueMangaHistory
    .map(item => {
      const manga = mangas.find(m => m.id === item.manga_id);
      if (!manga) return null;
      
      // With real UUIDs, we can't easily guess chapter numbers or next chapters without fetching chapter metadata.
      // For now, we'll display the manga and link to the last read chapter.
      // Progress calculation is skipped for MVP as it requires fetching all chapters.
      
      return {
        ...item,
        manga,
        progressPercentage: 0, // Placeholder
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);

  if (recentlyRead.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Continue Reading</h2>
            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
          </div>
        </div>
        <Link to="/profile">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentlyRead.map((item) => (
          <Link
            key={item.manga_id}
            to={`/manga/${item.manga_id}/chapter/${item.chapter_id}`}
            className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
          >
            <div className="flex gap-4 p-4">
              {/* Cover */}
              <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={item.manga.cover}
                  alt={item.manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {item.manga.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last read: {new Date(item.read_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Continue Button */}
                <Button size="sm" className="mt-3 w-full gap-2">
                  <Play className="h-3 w-3" />
                  Continue Reading
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
