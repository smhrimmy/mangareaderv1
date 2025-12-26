import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  manga_id: string;
  chapter_id: string | null;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar_url?: string;
  isLiked?: boolean;
  replies?: Comment[];
}

export const useComments = (mangaId: string, chapterId?: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setComments([]);
    setIsLoading(false);
  }, [mangaId, chapterId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    toast.info("Comments feature requires backend update");
  };

  const deleteComment = async (commentId: string) => {};

  const likeComment = async (commentId: string) => {};

  const unlikeComment = async (commentId: string) => {};

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    refetch: fetchComments
  };
};
