import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ReadingProgressBarProps {
  currentChapter: number;
  totalChapters: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ReadingProgressBar = ({ 
  currentChapter, 
  totalChapters, 
  className,
  showLabel = true,
  size = "md"
}: ReadingProgressBarProps) => {
  const percentage = Math.round((currentChapter / totalChapters) * 100);
  
  const heightClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  }[size];

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{currentChapter}/{totalChapters} chapters ({percentage}%)</span>
        </div>
      )}
      <Progress value={percentage} className={heightClass} />
    </div>
  );
};
