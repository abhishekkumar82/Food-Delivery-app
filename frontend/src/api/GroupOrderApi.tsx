import { GroupOrder } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCreateGroupOrder = () => {
  const { getAccessTokenSilently } = useAuth0();
  const request = async (restaurantId: string): Promise<GroupOrder> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/group-orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restaurantId }),
    });
    if (!response.ok) throw new Error("Failed to create group");
    return response.json();
  };
  const { mutateAsync: createGroup, isLoading } = useMutation(request);
  return { createGroup, isLoading };
};

export const useJoinGroupOrder = () => {
  const { getAccessTokenSilently } = useAuth0();
  const request = async (code: string): Promise<GroupOrder> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/group-orders/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to join");
    return data;
  };
  const { mutateAsync: joinGroup, isLoading } = useMutation(request);
  return { joinGroup, isLoading };
};

export const useGetGroupOrder = (code?: string) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const request = async (): Promise<GroupOrder> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/group-orders/${code}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Group not found");
    return response.json();
  };
  const { data: group, isLoading } = useQuery(
    ["fetchGroupOrder", code],
    request,
    {
      enabled: isAuthenticated && !!code,
      refetchInterval: 4000, // near-live shared cart
    }
  );
  return { group, isLoading };
};

export const useAddGroupItem = (code: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const request = async (item: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/group-orders/${code}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );
    if (!response.ok) throw new Error("Failed to add item");
    return response.json();
  };
  const { mutateAsync: addItem } = useMutation(request, {
    onSuccess: () => queryClient.invalidateQueries(["fetchGroupOrder", code]),
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { addItem };
};

export const useRemoveGroupItem = (code: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const request = async (itemId: string) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/group-orders/${code}/items/${itemId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Failed to remove item");
    return response.json();
  };
  const { mutateAsync: removeItem } = useMutation(request, {
    onSuccess: () => queryClient.invalidateQueries(["fetchGroupOrder", code]),
  });
  return { removeItem };
};

export const useCheckoutGroupOrder = (code: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const request = async (): Promise<{ restaurantId: string }> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/group-orders/${code}/checkout`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to place order");
    return data;
  };
  const { mutateAsync: checkoutGroup, isLoading } = useMutation(request, {
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { checkoutGroup, isLoading };
};
