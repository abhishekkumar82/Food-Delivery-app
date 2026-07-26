import { Recommendation, Restaurant, ReviewSummary } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetRecommendations = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const request = async (): Promise<{
    source: string;
    recommendations: Recommendation[];
  }> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/ai/recommendations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    return response.json();
  };

  const { data, isLoading } = useQuery("fetchRecommendations", request, {
    enabled: isAuthenticated,
  });
  return { data, isLoading };
};

export const useGetReviewSummary = (restaurantId?: string) => {
  const request = async (): Promise<ReviewSummary> => {
    const response = await fetch(
      `${API_BASE_URL}/api/ai/review-summary/${restaurantId}`
    );
    if (!response.ok) throw new Error("Failed to fetch summary");
    return response.json();
  };

  const { data: summary, isLoading } = useQuery(
    ["reviewSummary", restaurantId],
    request,
    { enabled: !!restaurantId }
  );
  return { summary, isLoading };
};

export const useAiSearch = () => {
  const request = async (
    query: string
  ): Promise<{ restaurants: Restaurant[]; source: string; parsed: any }> => {
    const response = await fetch(`${API_BASE_URL}/api/ai/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error("Search failed");
    return response.json();
  };

  const { mutateAsync: search, isLoading, data } = useMutation(request);
  return { search, isLoading, data };
};
