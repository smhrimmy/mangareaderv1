import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface NotificationSubscription {
  id: string;
  manga_id: string;
  email_enabled: boolean;
  last_notified_chapter: string | null;
}

export const useChapterNotifications = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("chapter_notifications")
      .select("*")
      .eq("user_id", user.id);

    if (data && !error) {
      setSubscriptions(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const subscribeToManga = async (mangaId: string, emailEnabled = true) => {
    if (!user) {
      toast.error("Please login to enable notifications");
      return;
    }

    const { error } = await supabase
      .from("chapter_notifications")
      .upsert({
        user_id: user.id,
        manga_id: mangaId,
        email_enabled: emailEnabled
      }, {
        onConflict: "user_id,manga_id"
      });

    if (error) {
      toast.error("Failed to enable notifications");
    } else {
      toast.success("Notifications enabled!");
      fetchSubscriptions();
    }
  };

  const unsubscribeFromManga = async (mangaId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("chapter_notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("manga_id", mangaId);

    if (!error) {
      toast.success("Notifications disabled");
      fetchSubscriptions();
    }
  };

  const toggleEmailNotifications = async (mangaId: string, enabled: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("chapter_notifications")
      .update({ email_enabled: enabled })
      .eq("user_id", user.id)
      .eq("manga_id", mangaId);

    if (!error) {
      toast.success(enabled ? "Email notifications enabled" : "Email notifications disabled");
      fetchSubscriptions();
    }
  };

  const isSubscribed = (mangaId: string): boolean => {
    return subscriptions.some(s => s.manga_id === mangaId);
  };

  const hasEmailEnabled = (mangaId: string): boolean => {
    return subscriptions.find(s => s.manga_id === mangaId)?.email_enabled ?? false;
  };

  return {
    subscriptions,
    isLoading,
    subscribeToManga,
    unsubscribeFromManga,
    toggleEmailNotifications,
    isSubscribed,
    hasEmailEnabled,
    refetch: fetchSubscriptions
  };
};
