-- Add unique constraint for reading history upsert
ALTER TABLE public.reading_history 
ADD CONSTRAINT reading_history_user_manga_chapter_unique 
UNIQUE (user_id, manga_id, chapter_id);