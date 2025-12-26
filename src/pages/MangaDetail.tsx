import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Star, Eye, BookOpen, Heart, Share2, Bell, 
  ChevronDown, Search, Play, Clock, Check, Plus, Loader2
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useMangaDetails, useMangaChapters } from "@/hooks/useManga";
import RatingStars from "@/components/manga/RatingStars";
import CommentSection from "@/components/comments/CommentSection";
import RecommendationsSection from "@/components/manga/RecommendationsSection";
import { toast } from "sonner";

const MangaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, getStatus } = useWatchlist();
  const { getLastRead, isChapterRead } = useReadingHistory();
  
  const { data: manga, isLoading: isMangaLoading, isError: isMangaError } = useMangaDetails(id || "");
  const { 
    data: chaptersData, 
    isLoading: isChaptersLoading,
    fetchNextPage,
    hasNextPage
  } = useMangaChapters(id || "");

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");

  const chapters = useMemo(() => {
    if (!chaptersData) return [];
    return chaptersData.pages.flat();
  }, [chaptersData]);

  if (isMangaLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isMangaError || !manga) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Manga Not Found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const inWatchlist = isInWatchlist(manga.id);
  const watchlistStatus = getStatus(manga.id);
  const lastRead = getLastRead(manga.id);

  const filteredChapters = chapters.filter(
    (ch) =>
      ch.number.toString().includes(chapterSearch) ||
      ch.title.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast.error("Please login to add to watchlist");
      navigate("/login");
      return;
    }
    
    if (inWatchlist) {
      await removeFromWatchlist(manga.id);
    } else {
      await addToWatchlist(manga.id);
    }
  };

  const handleContinueReading = () => {
    if (lastRead) {
      navigate(`/manga/${manga.id}/chapter/${lastRead.chapter_id}`);
    } else if (chapters.length > 0) {
      // Start from the first chapter (usually the last in the list if sorted desc, but let's check sorting)
      // MangaDex returns desc by default, so last item is first chapter
      const firstChapter = chapters[chapters.length - 1];
      navigate(`/manga/${manga.id}/chapter/${firstChapter.id}`);
    }
  };

  const getContinueLabel = () => {
    if (lastRead) {
      // Find the chapter in the list to get its number
      const chapter = chapters.find(c => c.id === lastRead.chapter_id);
      if (chapter) {
        return `Continue Ch. ${chapter.number}`;
      }
      // Fallback if chapter not found in current list (maybe pagination)
      // Try to parse if format allows, otherwise just say "Continue Reading"
      // Avoid showing UUID
      return "Continue Reading";
    }
    return "Start Reading";
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: manga.title,
        text: manga.description,
        url: window.location.href
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{manga.title}</span>
        </nav>
      </div>

      {/* Manga Info Section */}
      <section className="relative pb-8">
        {/* Background */}
        <div className="absolute inset-0 h-64 overflow-hidden">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-full object-cover blur-xl opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 pt-8">
            {/* Cover */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full rounded-xl shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* Title & Rating */}
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {manga.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <RatingStars mangaId={manga.id} size="md" />
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{manga.views} Views</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {manga.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
                <Badge 
                  variant={manga.status === "Ongoing" ? "default" : "outline"}
                  className={manga.status === "Completed" ? "border-success text-success" : ""}
                >
                  {manga.status}
                </Badge>
              </div>

              {/* Description */}
              <p className={`text-muted-foreground leading-relaxed mb-2 ${!isDescExpanded && "line-clamp-3"}`}>
                {manga.description}
              </p>
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-primary text-sm hover:underline mb-6"
              >
                {isDescExpanded ? "Show less" : "Show more"}
              </button>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button size="lg" className="gap-2" onClick={handleContinueReading} disabled={chapters.length === 0}>
                  <Play className="h-5 w-5" />
                  {getContinueLabel()}
                </Button>
                <Button 
                  size="lg" 
                  variant={inWatchlist ? "secondary" : "outline"} 
                  className="gap-2"
                  onClick={handleWatchlistToggle}
                >
                  {inWatchlist ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Author</span>
                  <p className="font-medium">{manga.author}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Artist</span>
                  <p className="font-medium">{manga.artist}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium text-success">{manga.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated</span>
                  <p className="font-medium">{manga.updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="container mx-auto px-4 py-6">
        <RecommendationsSection mangaId={manga.id} title="Similar Manga" />
      </section>

      {/* Chapters Section */}
      <section className="container mx-auto px-4 py-8">
        {/* Chapter Alert */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">New Chapter Alert</p>
              <p className="text-sm text-muted-foreground">
                Get notified when new chapters are released.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enable Notifications</span>
            <Switch />
          </div>
        </div>

        {/* Chapter List Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapters ({chapters.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find Chapter..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chapter List */}
        {isChaptersLoading ? (
           <div className="flex justify-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {filteredChapters.map((chapter) => {
              const isRead = isChapterRead(manga.id, chapter.id);
              
              return (
                <Link
                  key={chapter.id}
                  to={`/manga/${manga.id}/chapter/${chapter.id}`}
                  className={`flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
                    isRead ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isRead ? "bg-success/20" : "bg-primary/20"
                    }`}>
                      {isRead ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Chapter {chapter.number}</p>
                      <p className="text-sm text-muted-foreground">{chapter.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {chapter.date}
                    </span>
                    <Button size="sm" variant="ghost">
                      Read
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="text-center mt-6">
            <Button variant="outline" className="gap-2" onClick={() => fetchNextPage()}>
              <ChevronDown className="h-4 w-4" />
              Load more chapters
            </Button>
          </div>
        )}
      </section>

      {/* Comments Section */}
      <section className="container mx-auto px-4 py-8">
        <CommentSection mangaId={manga.id} />
      </section>
    </Layout>
  );
};

export default MangaDetail;
