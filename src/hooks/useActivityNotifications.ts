import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface ActivityNotification {
  id: string;
  type: "list_updated" | "new_follower" | "manga_added";
  userId: string;
  username: string;
  listName?: string;
  mangaTitle?: string;
  timestamp: string;
}

export const useActivityNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);

  // Fetch followed user IDs
  useEffect(() => {
    if (!user) {
      setFollowedUserIds([]);
      return;
    }

    const fetchFollowing = async () => {
      const { data } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);
      
      if (data) {
        setFollowedUserIds(data.map(f => f.following_id));
      }
    };

    fetchFollowing();
  }, [user]);

  // Subscribe to real-time updates from followed users' shared lists
  useEffect(() => {
    if (!user || followedUserIds.length === 0) return;

    const channel = supabase
      .channel('followed-users-activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_lists'
        },
        async (payload) => {
          const listData = payload.new as {
            user_id: string;
            name: string;
            is_public: boolean;
            manga_ids: string[];
          };
          
          if (!followedUserIds.includes(listData.user_id)) return;
          if (!listData.is_public) return;
          
          console.log('List activity from followed user:', payload);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', listData.user_id)
            .maybeSingle();

          const notification: ActivityNotification = {
            id: crypto.randomUUID(),
            type: payload.eventType === 'INSERT' ? "list_updated" : "manga_added",
            userId: listData.user_id,
            username: profile?.username || 'A user',
            listName: listData.name,
            timestamp: new Date().toISOString()
          };

          setNotifications(prev => [notification, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);

          toast.info(
            payload.eventType === 'INSERT'
              ? `${notification.username} created a new list: "${listData.name}"`
              : `${notification.username} updated "${listData.name}"`
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, followedUserIds]);

  // Subscribe to new followers
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('new-followers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_follows',
          filter: `following_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New follower:', payload);
          
          const followData = payload.new as { follower_id: string };
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', followData.follower_id)
            .maybeSingle();

          const notification: ActivityNotification = {
            id: crypto.randomUUID(),
            type: "new_follower",
            userId: followData.follower_id,
            username: profile?.username || 'Someone',
            timestamp: new Date().toISOString()
          };

          setNotifications(prev => [notification, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);

          toast.success(`${notification.username} started following you!`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAllRead,
    clearNotifications
  };
};
