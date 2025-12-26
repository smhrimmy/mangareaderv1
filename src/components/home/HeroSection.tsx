import { Link } from "react-router-dom";
import { Play, BookmarkPlus, Star, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-manga.jpg";
import type { Manga } from "@/lib/data";

interface HeroSectionProps {
  featuredManga: Manga;
}

const HeroSection = ({ featuredManga }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Featured Manga"
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-fade-in">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default" className="bg-primary/90">
              Featured
            </Badge>
            {featuredManga.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
            <Badge variant="outline" className="border-success text-success">
              {featuredManga.status}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {featuredManga.title}
          </h1>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span>{featuredManga.rating}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{featuredManga.views} Views</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Ch. {featuredManga.latestChapter}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
            {featuredManga.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to={`/manga/${featuredManga.id}`}>
              <Button size="lg" className="gap-2 hover-glow">
                <Play className="h-5 w-5" />
                Read Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <BookmarkPlus className="h-5 w-5" />
              Add to Library
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
