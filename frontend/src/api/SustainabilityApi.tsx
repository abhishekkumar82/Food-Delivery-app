import { Sustainability } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetSustainability = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const request = async (): Promise<Sustainability> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/sustainability`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch sustainability");
    return response.json();
  };

  const { data, isLoading } = useQuery("fetchSustainability", request, {
    enabled: isAuthenticated,
  });
  return { data, isLoading };
};
