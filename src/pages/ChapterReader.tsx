import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, Home, List, Settings,
  ZoomIn, ZoomOut, ArrowUp, Maximize, Minimize,
  BookOpen, Layers, Bookmark, BookmarkCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useMangaDetails, useMangaChapters, useChapterPages, useChapterMetadata } from "@/hooks/useManga";
import { toast } from "sonner";

type ReaderMode = "scroll" | "page";

const ChapterReader = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress, getProgress } = useReadingHistory();
  
  const { data: manga } = useMangaDetails(id || "");
  const { data: chaptersData } = useMangaChapters(id || "");
  const { data: pages = [], isLoading: isPagesLoading } = useChapterPages(chapterId || "");
  const { data: chapterMetadata } = useChapterMetadata(chapterId || "");

  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readerMode, setReaderMode] = useState<ReaderMode>("scroll");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Flatten chapters to find current, next, prev
  const chapters = useMemo(() => {
    if (!chaptersData) return [];
    return chaptersData.pages.flat();
  }, [chaptersData]);

  const currentChapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
  // MangaDex returns descending order (latest first), so next chapter is index - 1, prev is index + 1
  // But wait, "next" in reading order means "next number".
  // If list is [Ch 10, Ch 9, ...], next chapter to read is Ch 11 (which would be index - 1 if it exists)
  // Let's assume standard descending sort.
  const nextChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : undefined;
  const prevChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : undefined;
  
  // Use metadata if available, otherwise try to find in list
  const chapterTitle = chapterMetadata?.title || chapters.find(c => c.id === chapterId)?.title || "Unknown Chapter";
  const chapterNumber = chapterMetadata?.number || chapters.find(c => c.id === chapterId)?.number || 0;

  const progress = pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0;
  
  const savedProgress = getProgress(id || "", chapterId || "");
  const hasBookmark = savedProgress && savedProgress.page_number > 0;

  // Load saved progress
  useEffect(() => {
    if (user && id && chapterId && savedProgress) {
      if (savedProgress.page_number > 1) {
        setCurrentPage(savedProgress.page_number - 1);
        toast.info(`Resuming from page ${savedProgress.page_number}`);
      }
    }
  }, [user, id, chapterId, savedProgress]);

  // Preload images
  useEffect(() => {
    if (pages.length > 0) {
      const preloadImage = (src: string) => {
        const img = new Image();
        img.src = src;
      };

      // Preload next 3 pages
      for (let i = 1; i <= 3; i++) {
        if (pages[currentPage + i]) {
          preloadImage(pages[currentPage + i]);
        }
      }
    }
  }, [currentPage, pages]);

  // Save progress
  useEffect(() => {
    if (user && id && chapterId && pages.length > 0) {
      const timer = setTimeout(() => {
        updateProgress(id, chapterId, currentPage + 1, pages.length);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, user, id, chapterId, pages.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "d":
          e.preventDefault();
          if (readerMode === "page" && currentPage < pages.length - 1) {
            setCurrentPage(p => p + 1);
          }
          break;
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          if (readerMode === "page" && currentPage > 0) {
            setCurrentPage(p => p - 1);
          }
          break;
        case "ArrowUp":
        case "w":
          if (readerMode === "scroll") {
            scrollContainerRef.current?.scrollBy({ top: -200, behavior: "smooth" });
          }
          break;
        case "ArrowDown":
        case "s":
          if (readerMode === "scroll") {
            scrollContainerRef.current?.scrollBy({ top: 200, behavior: "smooth" });
          }
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          setReaderMode(m => m === "scroll" ? "page" : "scroll");
          break;
        case "Escape":
          setShowControls(true);
          break;
        case "+":
        case "=":
          setZoom(z => Math.min(200, z + 10));
          break;
        case "-":
          setZoom(z => Math.max(50, z - 10));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages.length, readerMode]);

  // Track scroll position for progress in scroll mode
  const handleScroll = useCallback(() => {
    if (readerMode !== "scroll" || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    // Find which page is currently in view
    let currentVisiblePage = 0;
    for (let i = 0; i < pageRefs.current.length; i++) {
      const pageEl = pageRefs.current[i];
      if (pageEl) {
        const rect = pageEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // Check if top of page is within the container or close to it
        if (rect.top <= containerRect.top + containerRect.height / 2) {
          currentVisiblePage = i;
        }
      }
    }
    
    setCurrentPage(currentVisiblePage);
  }, [readerMode]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && readerMode === "scroll") {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [readerMode, handleScroll]);

  // Reset page when chapter changes
  useEffect(() => {
    setCurrentPage(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [chapterId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToPage = (page: number) => {
    if (page < 0 || page >= pages.length) return;
    setCurrentPage(page);
    
    if (readerMode === "scroll" && pageRefs.current[page]) {
      pageRefs.current[page]?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBookmark = () => {
    if (!user) {
      toast.error("Please login to bookmark");
      return;
    }
    if (id && chapterId) {
      updateProgress(id, chapterId, currentPage + 1, pages.length);
      toast.success(`Bookmarked page ${currentPage + 1}`);
    }
  };

  if (isPagesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Pages Found</h1>
          <Link to={`/manga/${id}`}>
            <Button>Back to Manga</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Top Bar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 glass transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/manga/${id}`}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-sm line-clamp-1">{manga?.title || "Loading..."}</h1>
              <p className="text-xs text-muted-foreground">
                Chapter {chapterNumber}: {chapterTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBookmark}
              title="Bookmark current page"
              className={hasBookmark ? "text-primary" : ""}
            >
              {hasBookmark ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            {/* Reader Mode Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setReaderMode(m => m === "scroll" ? "page" : "scroll")}
              title={readerMode === "scroll" ? "Switch to page mode" : "Switch to scroll mode"}
            >
              {readerMode === "scroll" ? <Layers className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </Button>
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link to={`/manga/${id}`}>
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Reader Content */}
      <main 
        ref={scrollContainerRef}
        className="flex-1 pt-16 pb-24 overflow-y-auto"
        onClick={() => setShowControls(s => !s)}
      >
        {readerMode === "scroll" ? (
          // Scroll Mode
          <div className="max-w-4xl mx-auto">
            {pages.map((page, index) => (
              <div 
                key={index} 
                ref={el => pageRefs.current[index] = el}
                className="relative"
              >
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="w-full"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          // Page Mode
          <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <div className="relative max-w-4xl mx-auto px-4">
              <img
                src={pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="max-h-[80vh] mx-auto"
                style={{ transform: `scale(${zoom / 100})` }}
              />
              
              {/* Page Navigation Overlays */}
              <button
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
                className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                disabled={currentPage === 0}
              />
              <button
                onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
                className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                disabled={currentPage === pages.length - 1}
              />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer 
        className={`fixed bottom-0 left-0 right-0 z-50 glass transition-transform duration-300 ${
          showControls ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="container mx-auto px-4 py-3">
          {/* Page Indicator */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="text-sm font-medium">
              Page {currentPage + 1} of {pages.length}
            </span>
          </div>

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              disabled={!prevChapter}
              onClick={() => prevChapter && navigate(`/manga/${id}/chapter/${prevChapter.id}`)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
                  }
                  setCurrentPage(0);
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              disabled={!nextChapter}
              onClick={() => nextChapter && navigate(`/manga/${id}/chapter/${nextChapter.id}`)}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">
              Keyboard: ← → (page) | + - (zoom) | M (mode) | F (fullscreen)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChapterReader;
