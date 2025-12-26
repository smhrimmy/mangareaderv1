-- Add theme preference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system'));

-- Create user_follows table for social features
CREATE TABLE public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Create shared_lists table for sharing reading lists
CREATE TABLE public.shared_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    manga_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapter_notifications table for tracking subscriptions
CREATE TABLE public.chapter_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    manga_id TEXT NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    last_notified_chapter TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, manga_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_notifications ENABLE ROW LEVEL SECURITY;

-- User follows policies
CREATE POLICY "Users can view all follows" 
ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Shared lists policies
CREATE POLICY "Public lists are viewable by everyone" 
ON public.shared_lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own lists" 
ON public.shared_lists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" 
ON public.shared_lists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" 
ON public.shared_lists FOR DELETE USING (auth.uid() = user_id);

-- Chapter notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.chapter_notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.chapter_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.chapter_notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.chapter_notifications FOR DELETE USING (auth.uid() = user_id);

-- Update trigger for shared_lists
CREATE TRIGGER update_shared_lists_updated_at
    BEFORE UPDATE ON public.shared_lists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();