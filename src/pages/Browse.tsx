import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search as SearchIcon, 
  Filter, 
  Grid, 
  List as ListIcon,
  X,
  SlidersHorizontal,
  ChevronDown,
  Loader2
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import MangaCard from "@/components/manga/MangaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { genres } from "@/lib/data";
import { useMangaList } from "@/hooks/useManga";
import { useInView } from "react-intersection-observer";

type SortOption = "latest" | "popular" | "rating" | "title";

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [genresOpen, setGenresOpen] = useState(true);

  // Fetch Manga
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useMangaList({ query });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten the pages into a single array of manga
  const results = useMemo(() => {
    if (!data) return [];
    return data.pages.flat();
  }, [data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const toggleGenre = (genre: string, type: "include" | "exclude") => {
    if (type === "include") {
      // Remove from excluded if it was there
      setExcludedGenres(prev => prev.filter(g => g !== genre));
      setSelectedGenres(prev =>
        prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
      );
    } else {
      // Remove from included if it was there
      setSelectedGenres(prev => prev.filter(g => g !== genre));
      setExcludedGenres(prev =>
        prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
      );
    }
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setExcludedGenres([]);
    setSelectedStatus("");
    setSortBy("popular");
    setQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = selectedGenres.length > 0 || excludedGenres.length > 0 || selectedStatus;

  const statuses = ["Ongoing", "Completed", "Hiatus"];
  const popularTags = ["Action", "Romance", "Fantasy", "Isekai", "Comedy", "Supernatural"];

  // Filter sidebar component (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Genres */}
      <Collapsible open={genresOpen} onOpenChange={setGenresOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold mb-3">
          <span>Genres</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${genresOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Click to include, right-click to exclude
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isIncluded = selectedGenres.includes(genre);
              const isExcluded = excludedGenres.includes(genre);
              
              return (
                <Badge
                  key={genre}
                  variant={isIncluded ? "default" : isExcluded ? "destructive" : "secondary"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleGenre(genre, "include")}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleGenre(genre, "exclude");
                  }}
                >
                  {isExcluded && <X className="h-3 w-3 mr-1" />}
                  {genre}
                </Badge>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Status */}
      <div>
        <p className="text-sm font-semibold mb-3">Status</p>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedStatus === status}
                onCheckedChange={(checked) => 
                  setSelectedStatus(checked ? status : "")
                }
              />
              <span className="text-sm">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Search Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-card to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Find your next <span className="text-gradient">adventure</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Discover thousands of manga titles across every genre.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, author or genre..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 pr-24 h-14 text-lg bg-secondary border-border"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedGenres.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleGenre(tag, "include")}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5" />
                  <h2 className="font-semibold">Filters</h2>
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Results Section */}
            <div className="flex-1">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={showFilters} onOpenChange={setShowFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                          <Badge variant="default" className="ml-1">
                            {selectedGenres.length + excludedGenres.length + (selectedStatus ? 1 : 0)}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="latest">Latest Update</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="title">A-Z</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Active filters display */}
                  {hasActiveFilters && (
                    <div className="hidden md:flex flex-wrap gap-2">
                      {selectedGenres.map(genre => (
                        <Badge key={genre} variant="default" className="gap-1">
                          {genre}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => toggleGenre(genre, "include")}
                          />
                        </Badge>
                      ))}
                      {excludedGenres.map(genre => (
                        <Badge key={genre} variant="destructive" className="gap-1">
                          <X className="h-3 w-3" />
                          {genre}
                          <X 
                            className="h-3 w-3 cursor-pointer ml-1" 
                            onClick={() => toggleGenre(genre, "exclude")}
                          />
                        </Badge>
                      ))}
                      {selectedStatus && (
                        <Badge variant="secondary" className="gap-1">
                          {selectedStatus}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setSelectedStatus("")}
                          />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* View Mode & Results Count */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {results.length} results
                  </span>
                  <div className="flex gap-1 p-1 bg-secondary rounded-lg">
                    <button
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                    >
                      <ListIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold text-destructive">Error loading manga</h3>
                  <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : results.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {results.map((item) => (
                    <MangaCard key={item.id} manga={item} />
                  ))}
                  {/* Infinite Scroll Trigger */}
                  <div ref={ref} className="col-span-full h-10 flex justify-center items-center">
                    {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No manga found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Browse;
