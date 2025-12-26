import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export const useSocialFeatures = (targetUserId?: string) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchFollowData = useCallback(async () => {
    setFollowers([]);
    setFollowing([]);
    setFollowerCount(0);
    setFollowingCount(0);
    setIsFollowing(false);
    setIsLoading(false);
  }, [user, targetUserId]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const followUser = async (userId: string) => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }
    toast.info("Social feature requires backend update");
  };

  const unfollowUser = async (userId: string) => {};

  return {
    followers,
    following,
    followerCount,
    followingCount,
    isFollowing,
    isLoading,
    followUser,
    unfollowUser,
    refetch: fetchFollowData
  };
};
