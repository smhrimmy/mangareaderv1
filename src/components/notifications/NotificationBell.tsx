import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, X, User, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivityNotifications } from "@/hooks/useActivityNotifications";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead, clearNotifications } = useActivityNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_follower":
        return <User className="h-4 w-4 text-primary" />;
      case "list_updated":
      case "manga_added":
        return <BookOpen className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationMessage = (notification: typeof notifications[0]) => {
    switch (notification.type) {
      case "new_follower":
        return `${notification.username} started following you`;
      case "list_updated":
        return `${notification.username} created "${notification.listName}"`;
      case "manga_added":
        return `${notification.username} updated "${notification.listName}"`;
      default:
        return "New activity";
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={`/user/${notification.userId}`}
                  className="flex items-start gap-3 p-4 hover:bg-secondary transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="p-2 bg-secondary rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{getNotificationMessage(notification)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Follow users to see their activity
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
