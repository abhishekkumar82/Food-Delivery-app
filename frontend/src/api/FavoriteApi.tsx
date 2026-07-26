import { Restaurant } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetFavorites = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getFavoritesRequest = async (): Promise<Restaurant[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user/favorites`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch favorites");
    return response.json();
  };

  const { data: favorites, isLoading } = useQuery(
    "fetchFavorites",
    getFavoritesRequest,
    { enabled: isAuthenticated }
  );
  return { favorites, isLoading };
};

export const useToggleFavorite = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const toggleRequest = async ({
    restaurantId,
    isFavorite,
  }: {
    restaurantId: string;
    isFavorite: boolean;
  }) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/my/user/favorites/${restaurantId}`,
      {
        method: isFavorite ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to update favorite");
    return response.json();
  };

  const { mutateAsync: toggleFavorite, isLoading } = useMutation(toggleRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchFavorites");
    },
    onError: () => {
      toast.error("Could not update favorite");
    },
  });

  return { toggleFavorite, isLoading };
};
