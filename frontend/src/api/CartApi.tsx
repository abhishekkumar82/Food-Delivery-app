import { Cart, CartItem } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetMyCart = (restaurantId?: string) => {
  const { getAccessTokenSilently } = useAuth0();

  const getCartRequest = async (): Promise<Cart> => {
    const accessToken = await getAccessTokenSilently();
    const query = restaurantId
      ? `?restaurantId=${encodeURIComponent(restaurantId)}`
      : "";
    const response = await fetch(`${API_BASE_URL}/api/my/cart${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }
    return response.json();
  };

  // cache per restaurant so switching restaurants doesn't reuse the wrong basket
  const { data: cart, isLoading } = useQuery(
    ["fetchMyCart", restaurantId],
    getCartRequest
  );
  return { cart, isLoading };
};

type UpdateCartRequest = {
  restaurantId?: string;
  items: CartItem[];
};

export const useUpdateMyCart = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const updateCartRequest = async (req: UpdateCartRequest): Promise<Cart> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/cart`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      throw new Error("Failed to update cart");
    }
    return response.json();
  };

  const { mutateAsync: updateCart, isLoading } = useMutation(updateCartRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchMyCart");
    },
  });

  return { updateCart, isLoading };
};

export const useClearMyCart = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const clearCartRequest = async () => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/cart`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error("Failed to clear cart");
    }
    return response.json();
  };

  const { mutateAsync: clearCart } = useMutation(clearCartRequest, {
    onSuccess: () => {
      toast.success("Cart cleared");
      queryClient.invalidateQueries("fetchMyCart");
    },
  });

  return { clearCart };
};
