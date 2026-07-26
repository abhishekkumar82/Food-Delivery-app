import { Review } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Read reviews for a restaurant, or for a specific dish when menuItemId is set.
export const useGetRestaurantReviews = (
  restaurantId?: string,
  menuItemId?: string
) => {
  const getReviewsRequest = async (): Promise<Review[]> => {
    const url = new URL(
      `${API_BASE_URL}/api/restaurant/${restaurantId}/reviews`
    );
    if (menuItemId) {
      url.searchParams.set("menuItemId", menuItemId);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    return response.json();
  };

  const { data: reviews, isLoading } = useQuery(
    ["fetchReviews", restaurantId, menuItemId],
    getReviewsRequest,
    { enabled: !!restaurantId }
  );

  return { reviews, isLoading };
};

type CreateReviewRequest = {
  restaurantId: string;
  rating: number;
  comment?: string;
  menuItemId?: string;
  orderId?: string;
  imageUrls?: string[];
};

export const useCreateReview = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const createReviewRequest = async (req: CreateReviewRequest) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/restaurant/${req.restaurantId}/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "Failed to submit review");
    }
    return response.json();
  };

  const { mutateAsync: createReview, isLoading } = useMutation(
    createReviewRequest,
    {
      onSuccess: () => {
        toast.success("Review submitted");
        queryClient.invalidateQueries("fetchReviews");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }
  );

  return { createReview, isLoading };
};

export const useDeleteReview = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const deleteReviewRequest = async ({
    restaurantId,
    reviewId,
  }: {
    restaurantId: string;
    reviewId: string;
  }) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/restaurant/${restaurantId}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete review");
    }
    return response.json();
  };

  const { mutateAsync: deleteReview, isLoading } = useMutation(
    deleteReviewRequest,
    {
      onSuccess: () => {
        toast.success("Review deleted");
        queryClient.invalidateQueries("fetchReviews");
      },
    }
  );

  return { deleteReview, isLoading };
};
