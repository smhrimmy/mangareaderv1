import mangaCover1 from "@/assets/manga-cover-1.jpg";
import mangaCover2 from "@/assets/manga-cover-2.jpg";
import mangaCover3 from "@/assets/manga-cover-3.jpg";
import mangaCover4 from "@/assets/manga-cover-4.jpg";
import mangaCover5 from "@/assets/manga-cover-5.jpg";
import mangaCover6 from "@/assets/manga-cover-6.jpg";

export interface Manga {
  id: string;
  title: string;
  cover: string;
  author: string;
  artist: string;
  status: "Ongoing" | "Completed" | "Hiatus";
  genres: string[];
  rating: number;
  views: string;
  description: string;
  chapters: Chapter[];
  latestChapter: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  date: string;
  pages: string[];
}

export const genres = [
  "Action",
  "Adventure", 
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Supernatural",
  "School",
  "Sports",
  "Historical",
  "Mystery",
  "Psychological",
];
