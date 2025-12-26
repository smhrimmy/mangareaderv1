import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocialFeatures } from "@/hooks/useSocialFeatures";
import { useAuth } from "@/hooks/useAuth";

interface FollowersDialogProps {
  userId: string;
}

const FollowersDialog = ({ userId }: FollowersDialogProps) => {
  const { user } = useAuth();
  const { followers, following, followerCount, followingCount, isLoading, followUser, unfollowUser } = useSocialFeatures(userId);
  const [open, setOpen] = useState(false);

  const isOwnProfile = user?.id === userId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-4 cursor-pointer">
          <div className="text-center">
            <p className="text-xl font-bold">{followerCount}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{followingCount}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="followers">
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="flex-1">
              Followers ({followerCount})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following ({followingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : followers.length > 0 ? (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <UserCard 
                    key={follower.user_id} 
                    user={follower} 
                    onFollow={() => followUser(follower.user_id)}
                    onUnfollow={() => unfollowUser(follower.user_id)}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No followers yet</p>
            )}
          </TabsContent>

          <TabsContent value="following" className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : following.length > 0 ? (
              <div className="space-y-3">
                {following.map((followed) => (
                  <UserCard 
                    key={followed.user_id} 
                    user={followed}
                    onFollow={() => followUser(followed.user_id)}
                    onUnfollow={() => unfollowUser(followed.user_id)}
                    currentUserId={user?.id}
                    showUnfollow={isOwnProfile}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Not following anyone</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface UserCardProps {
  user: {
    user_id: string;
    username: string | null;
    avatar_url: string | null;
  };
  onFollow: () => void;
  onUnfollow: () => void;
  currentUserId?: string;
  showUnfollow?: boolean;
}

const UserCard = ({ user, onFollow, onUnfollow, currentUserId, showUnfollow }: UserCardProps) => {
  const isCurrentUser = currentUserId === user.user_id;

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
      <Link to={`/user/${user.user_id}`} className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url || ""} />
          <AvatarFallback>
            {(user.username || "U").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.username || "Anonymous"}</span>
      </Link>
      {!isCurrentUser && showUnfollow && (
        <Button size="sm" variant="ghost" onClick={onUnfollow}>
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FollowersDialog;
