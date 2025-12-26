import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import MangaGrid from "@/components/manga/MangaGrid";
import { ContinueReading } from "@/components/home/ContinueReading";
import { useMangaList } from "@/hooks/useManga";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: latestData, isLoading: isLatestLoading } = useMangaList({
    limit: 6,
    sort: { latestUploadedChapter: "desc" }
  });

  const { data: popularData, isLoading: isPopularLoading } = useMangaList({
    limit: 6,
    sort: { followedCount: "desc" }
  });

  const latestUpdates = useMemo(() => latestData?.pages.flat() || [], [latestData]);
  const popularManga = useMemo(() => popularData?.pages.flat() || [], [popularData]);
  const featured = popularManga[0];

  if (isLatestLoading || isPopularLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <title>MangaReader - Read Manga Online Free</title>
      <meta name="description" content="Read your favorite manga online for free. High quality images, fast loading, and a huge collection of manga titles." />
      
      {/* Hero Section */}
      {featured && <HeroSection featuredManga={featured} />}

      {/* Main Content */}
      <div className="container mx-auto px-4">
        {/* Continue Reading */}
        <ContinueReading />

        {/* Latest Updates */}
        <MangaGrid
          manga={latestUpdates}
          title="Latest Updates"
          showViewAll
          viewAllLink="/latest"
        />

        {/* Popular Manga */}
        <MangaGrid
          manga={popularManga}
          title="Popular Manga"
          showViewAll
          viewAllLink="/browse"
        />
      </div>
    </Layout>
  );
};

export default Index;
