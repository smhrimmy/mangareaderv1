import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    const userId = targetUserId || user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Get followers
    const { data: followersData } = await supabase
      .from("user_follows")
      .select("follower_id")
      .eq("following_id", userId);

    // Get following
    const { data: followingData } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", userId);

    setFollowerCount(followersData?.length || 0);
    setFollowingCount(followingData?.length || 0);

    // Check if current user follows target
    if (user && targetUserId && user.id !== targetUserId) {
      const { data: followCheck } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single();
      
      setIsFollowing(!!followCheck);
    }

    // Get profile details for followers
    if (followersData && followersData.length > 0) {
      const followerIds = followersData.map(f => f.follower_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, bio")
        .in("user_id", followerIds);
      setFollowers(profiles || []);
    }

    // Get profile details for following
    if (followingData && followingData.length > 0) {
      const followingIds = followingData.map(f => f.following_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, bio")
        .in("user_id", followingIds);
      setFollowing(profiles || []);
    }

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

    if (user.id === userId) {
      toast.error("You can't follow yourself");
      return;
    }

    const { error } = await supabase
      .from("user_follows")
      .insert({
        follower_id: user.id,
        following_id: userId
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("Already following this user");
      } else {
        toast.error("Failed to follow user");
      }
    } else {
      toast.success("Following!");
      setIsFollowing(true);
      fetchFollowData();
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", userId);

    if (!error) {
      toast.success("Unfollowed");
      setIsFollowing(false);
      fetchFollowData();
    }
  };

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
