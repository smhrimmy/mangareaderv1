import { useState } from "react";
import { MessageCircle, Heart, Reply, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  mangaId: string;
  chapterId?: string;
}

const CommentSection = ({ mangaId, chapterId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment, likeComment, unlikeComment } = useComments(mangaId, chapterId);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await addComment(newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await addComment(replyContent, parentId);
    setReplyContent("");
    setReplyingTo(null);
    setIsSubmitting(false);
  };

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (isLiked) {
      await unlikeComment(commentId);
    } else {
      await likeComment(commentId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/4"></div>
          <div className="h-20 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      {user ? (
        <div className="flex gap-4 mb-8">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[80px] mb-2"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!newComment.trim() || isSubmitting}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-muted-foreground">Please login to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.avatar_url || ""} />
                <AvatarFallback className="bg-secondary">
                  {(comment.username || "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{comment.username || "Anonymous"}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground mb-2">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment.id, comment.isLiked || false)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      comment.isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`} />
                    {comment.likes_count}
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && user && (
                  <div className="mt-4 flex gap-3">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="min-h-[60px]"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyContent.trim() || isSubmitting}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={reply.avatar_url || ""} />
                          <AvatarFallback className="bg-secondary text-xs">
                            {(reply.username || "A").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{reply.username || "Anonymous"}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mb-1">{reply.content}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLike(reply.id, reply.isLiked || false)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                reply.isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                              }`}
                            >
                              <Heart className={`h-3 w-3 ${reply.isLiked ? "fill-current" : ""}`} />
                              {reply.likes_count}
                            </button>
                            {user?.id === reply.user_id && (
                              <button
                                onClick={() => deleteComment(reply.id)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
