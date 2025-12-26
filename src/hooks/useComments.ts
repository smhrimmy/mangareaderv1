import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    let query = supabase
      .from("comments")
      .select("*")
      .eq("manga_id", mangaId)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (chapterId) {
      query = query.eq("chapter_id", chapterId);
    } else {
      query = query.is("chapter_id", null);
    }

    const { data: commentsData, error } = await query;

    if (commentsData && !error) {
      // Fetch profiles for all comments
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch user's likes
      let userLikes: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id);
        userLikes = likes?.map(l => l.comment_id) || [];
      }

      // Fetch replies for each comment
      const commentIds = commentsData.map(c => c.id);
      const { data: repliesData } = await supabase
        .from("comments")
        .select("*")
        .in("parent_id", commentIds)
        .order("created_at", { ascending: true });

      const repliesMap = new Map<string, Comment[]>();
      repliesData?.forEach(reply => {
        const profile = profileMap.get(reply.user_id);
        const enrichedReply = {
          ...reply,
          username: profile?.username || "Anonymous",
          avatar_url: profile?.avatar_url,
          isLiked: userLikes.includes(reply.id)
        };
        
        if (!repliesMap.has(reply.parent_id!)) {
          repliesMap.set(reply.parent_id!, []);
        }
        repliesMap.get(reply.parent_id!)!.push(enrichedReply);
      });

      const enrichedComments = commentsData.map(comment => {
        const profile = profileMap.get(comment.user_id);
        return {
          ...comment,
          username: profile?.username || "Anonymous",
          avatar_url: profile?.avatar_url,
          isLiked: userLikes.includes(comment.id),
          replies: repliesMap.get(comment.id) || []
        };
      });

      setComments(enrichedComments);
    }
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

    const { error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        manga_id: mangaId,
        chapter_id: chapterId || null,
        parent_id: parentId || null,
        content
      });

    if (error) {
      toast.error("Failed to post comment");
    } else {
      toast.success("Comment posted");
      fetchComments();
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (!error) {
      toast.success("Comment deleted");
      fetchComments();
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to like");
      return;
    }

    const { error } = await supabase
      .from("comment_likes")
      .insert({
        user_id: user.id,
        comment_id: commentId
      });

    if (!error) {
      fetchComments();
    }
  };

  const unlikeComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("comment_id", commentId);

    if (!error) {
      fetchComments();
    }
  };

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
