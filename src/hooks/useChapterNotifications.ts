import { useState, useEffect, useCallback } from "react";
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
    setSubscriptions([]);
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
    toast.info("Notifications feature requires backend update");
  };

  const unsubscribeFromManga = async (mangaId: string) => {};

  const toggleEmailNotifications = async (mangaId: string, enabled: boolean) => {};

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
