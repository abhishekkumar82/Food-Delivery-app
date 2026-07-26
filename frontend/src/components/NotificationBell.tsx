import { useGetNotifications, useMarkNotifications } from "@/api/NotificationApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useGetMyUser } from "@/api/MyUserApi";

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount } = useGetNotifications();
  const { markRead } = useMarkNotifications();
  const { currentUser } = useGetMyUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // join the user's socket room and refresh the list on live pushes
  const userId = currentUser?._id;
  useEffect(() => {
    const socket = getSocket();
    if (userId) socket.emit("joinUser", userId);
    const onNotification = () =>
      queryClient.invalidateQueries("fetchNotifications");
    socket.on("notification", onNotification);
    return () => {
      socket.off("notification", onNotification);
    };
  }, [userId, queryClient]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex items-center px-2">
        <Bell className="text-orange-500" />
        {unreadCount > 0 && (
          <span className="absolute -right-0 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="font-bold">Notifications</span>
          {unreadCount > 0 && (
            <button
              className="text-xs text-orange-500 hover:underline"
              onClick={() => markRead(undefined)}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  if (!n.isRead) markRead(n._id);
                  if (n.type === "order") navigate("/order-status");
                }}
                className={`flex w-full flex-col gap-0.5 border-b px-3 py-2 text-left hover:bg-gray-50 ${
                  n.isRead ? "" : "bg-orange-50"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{n.title}</span>
                  <span className="text-[10px] text-gray-400">
                    {timeAgo(n.createdAt)}
                  </span>
                </span>
                {n.message && (
                  <span className="text-xs text-gray-600">{n.message}</span>
                )}
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
