import { RestaurantAnalytics } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetRestaurantAnalytics = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getAnalyticsRequest = async (): Promise<RestaurantAnalytics> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/my/restaurant/analytics`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch analytics");
    return response.json();
  };

  const { data: analytics, isLoading } = useQuery(
    "fetchRestaurantAnalytics",
    getAnalyticsRequest,
    { enabled: isAuthenticated }
  );
  return { analytics, isLoading };
};
