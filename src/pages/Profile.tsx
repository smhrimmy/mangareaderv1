import { Link, useNavigate } from "react-router-dom";
import { Edit, BookOpen, Clock, LogOut, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useMangaListByIds } from "@/hooks/useManga";
import RecommendationsSection from "@/components/manga/RecommendationsSection";
import { useEffect, useMemo } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const { watchlist, getByStatus, isLoading: watchlistLoading } = useWatchlist();
  const { history, isLoading: historyLoading } = useReadingHistory();

  const allMangaIds = useMemo(() => {
    return Array.from(new Set(watchlist.map(item => item.manga_id)));
  }, [watchlist]);

  const { data: mangas = [], isLoading: isMangaLoading } = useMangaListByIds(allMangaIds);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user || isMangaLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const readingList = getByStatus("reading");
  const completedList = getByStatus("completed");
  const planToReadList = getByStatus("plan_to_read");
  const onHoldList = getByStatus("on_hold");
  const droppedList = getByStatus("dropped");

  const getMangaWithProgress = (items: typeof watchlist) => {
    return items.map(item => {
      const manga = mangas.find(m => m.id === item.manga_id);
      const lastRead = history.find(h => h.manga_id === item.manga_id);
      
      // Simplify progress for MVP
      const currentChapter = 0; 
      const totalChapters = 0;
      const progressPercentage = 0;
      
      return {
        ...item,
        manga,
        currentChapter,
        totalChapters,
        progressPercentage,
        progress: lastRead ? "In Progress" : "Not started",
        lastRead: lastRead?.read_at
      };
    }).filter(item => item.manga);
  };

  const tabData = {
    "Currently Reading": getMangaWithProgress(readingList),
    "Completed": getMangaWithProgress(completedList),
    "Plan to Read": getMangaWithProgress(planToReadList),
    "On Hold": getMangaWithProgress(onHoldList),
    "Dropped": getMangaWithProgress(droppedList)
  };

  const totalMangaRead = new Set(history.map(h => h.manga_id)).size;
  const totalChaptersRead = history.filter(h => h.completed).length;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {(profile?.username || user.email || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{profile?.username || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {/* Edit Profile Button */}
              <div className="space-y-2">
                <Link to="/settings">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full gap-2 text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalMangaRead}</p>
                    <p className="text-sm text-muted-foreground">Manga Read</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Clock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalChaptersRead}</p>
                    <p className="text-sm text-muted-foreground">Chapters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Watchlist */}
          <div className="lg:col-span-3 space-y-8">
            {/* Recommendations */}
            <RecommendationsSection title="Recommended for You" />

            {/* Watchlist */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Watchlist</h1>
                <p className="text-muted-foreground">Track your reading progress.</p>
              </div>

              <Tabs defaultValue="Currently Reading">
                <div className="flex items-center justify-between mb-4 overflow-x-auto">
                  <TabsList className="flex-shrink-0">
                    {Object.entries(tabData).map(([tab, items]) => (
                      <TabsTrigger key={tab} value={tab}>
                        {tab}
                        {items.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {items.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {Object.entries(tabData).map(([tab, items]) => (
                  <TabsContent key={tab} value={tab}>
                    {items.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item) => (
                          <Link
                            key={item.manga_id}
                            to={`/manga/${item.manga_id}`}
                            className="group bg-card border border-border rounded-xl overflow-hidden hover-lift"
                          >
                            {/* Cover */}
                            <div className="aspect-[3/4] relative overflow-hidden">
                              <img
                                src={item.manga?.cover}
                                alt={item.manga?.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Info */}
                            <div className="p-3">
                              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {item.manga?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">{item.manga?.author}</p>
                              
                              {/* Progress Bar */}
                              {item.currentChapter > 0 && (
                                <div className="mb-2">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Ch. {item.currentChapter}/{item.totalChapters}</span>
                                    <span>{item.progressPercentage}%</span>
                                  </div>
                                  <Progress value={item.progressPercentage} className="h-1.5" />
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {item.progress}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Latest: Ch. {item.manga?.latestChapter}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* Add New Card */}
                        <Link
                          to="/browse"
                          className="flex flex-col items-center justify-center aspect-[3/4] bg-card border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-secondary/50 transition-colors"
                        >
                          <div className="text-center p-4">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                              <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium">Discover New Manga</p>
                            <p className="text-sm text-muted-foreground">Browse our collection</p>
                          </div>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-card border border-border rounded-xl">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No manga in this list</h3>
                        <p className="text-muted-foreground mb-4">
                          Start exploring and add some manga to your {tab.toLowerCase()} list.
                        </p>
                        <Link to="/browse">
                          <Button>Browse Manga</Button>
                        </Link>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
