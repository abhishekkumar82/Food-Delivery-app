import { AppNotification } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type NotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

export const useGetNotifications = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getRequest = async (): Promise<NotificationsResponse> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  };

  const { data, isLoading } = useQuery("fetchNotifications", getRequest, {
    enabled: isAuthenticated,
    refetchInterval: 20000,
  });
  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
  };
};

export const useMarkNotifications = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const markRequest = async (id?: string) => {
    const accessToken = await getAccessTokenSilently();
    const url = id
      ? `${API_BASE_URL}/api/my/notifications/${id}/read`
      : `${API_BASE_URL}/api/my/notifications/read-all`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to mark read");
    return response.json();
  };

  const { mutateAsync: markRead } = useMutation(markRequest, {
    onSuccess: () => queryClient.invalidateQueries("fetchNotifications"),
  });

  return { markRead };
};
