import MangaCard from "./MangaCard";
import type { Manga } from "@/lib/data";

interface MangaGridProps {
  manga: Manga[];
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const MangaGrid = ({ manga, title, showViewAll, viewAllLink }: MangaGridProps) => {
  return (
    <section className="py-8">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            {title}
          </h2>
          {showViewAll && viewAllLink && (
            <a
              href={viewAllLink}
              className="text-sm text-primary hover:underline"
            >
              View All →
            </a>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {manga.map((m) => (
          <MangaCard key={m.id} manga={m} />
        ))}
      </div>
    </section>
  );
};

export default MangaGrid;
