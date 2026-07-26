import { Order } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
  const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;
  
  export const useGetMyOrders = () => {
    const { getAccessTokenSilently } = useAuth0();
  
    const getMyOrdersRequest = async (): Promise<Order[]> => {
      const accessToken = await getAccessTokenSilently();
  
      const response = await fetch(`${API_BASE_URL}/api/order`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to get orders");
      }
  
      return response.json();
    };
  
    const { data: orders, isLoading } = useQuery(
      "fetchMyOrders",
      getMyOrdersRequest,
      {
        refetchInterval: 5000,
      }
    );
  
    return { orders, isLoading };
  };
  

export const useGetMyOrder = (orderId?: string) => {
  const { getAccessTokenSilently } = useAuth0();

  const getOrderRequest = async (): Promise<Order> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to get order");
    return response.json();
  };

  const { data: order, isLoading } = useQuery(
    ["fetchMyOrder", orderId],
    getOrderRequest,
    { enabled: !!orderId }
  );
  return { order, isLoading };
};

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
  // ---- Tier 2 ----
  couponCode?: string;
  walletApplied?: number;
  scheduledFor?: string;
  paymentMethod?: "card" | "cod" | "upi";
};

// COD / UPI checkout — creates the order server-side without Stripe.
export const useCreateCodOrder = () => {
  const { getAccessTokenSilently } = useAuth0();

  const request = async (body: CheckoutSessionRequest) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/order/checkout/cod`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not place order");
    return data;
  };

  const { mutateAsync: createCodOrder, isLoading } = useMutation(request, {
    onSuccess: () => {
      toast.success("Order placed!");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { createCodOrder, isLoading };
};

// Reorder a past order — rebuilds the server cart and returns the restaurantId.
export const useReorder = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const request = async (orderId: string): Promise<{ restaurantId: string }> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/order/reorder/${orderId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not reorder");
    return data;
  };

  const { mutateAsync: reorder, isLoading } = useMutation(request, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchMyCart");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { reorder, isLoading };
};

export const useCreateCheckoutSession = () => {
  const { getAccessTokenSilently } = useAuth0();

  const createCheckoutSessionRequest = async (
    checkoutSessionRequest: CheckoutSessionRequest
  ) => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${API_BASE_URL}/api/order/checkout/create-checkout-session`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutSessionRequest),
      }
    );

    if (!response.ok) {
      throw new Error("Unable to create checkout session");
    }

    return response.json();
  };

  const {
    mutateAsync: createCheckoutSession,
    isLoading,
    error,
    reset,
  } = useMutation(createCheckoutSessionRequest);

  if (error) {
    toast.error(error.toString());
    reset();
  }

  return {
    createCheckoutSession,
    isLoading,
  };
};