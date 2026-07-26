import { Gamification } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetGamification = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const request = async (): Promise<Gamification> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/gamification`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch rewards");
    return response.json();
  };

  const { data, isLoading } = useQuery("fetchGamification", request, {
    enabled: isAuthenticated,
  });
  return { data, isLoading };
};
