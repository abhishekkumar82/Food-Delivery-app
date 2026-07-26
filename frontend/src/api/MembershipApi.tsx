import { MembershipResponse } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetMembership = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const request = async (): Promise<MembershipResponse> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/membership`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch membership");
    return response.json();
  };

  const { data, isLoading } = useQuery("fetchMembership", request, {
    enabled: isAuthenticated,
  });
  return { data, isLoading };
};

export const useSubscribeMembership = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const request = async (planId: string) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/membership/subscribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId }),
    });
    if (!response.ok) throw new Error("Failed to subscribe");
    return response.json();
  };

  const { mutateAsync: subscribe, isLoading } = useMutation(request, {
    onSuccess: () => {
      toast.success("Membership activated!");
      queryClient.invalidateQueries("fetchMembership");
      queryClient.invalidateQueries("fetchWallet");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { subscribe, isLoading };
};

export const useCancelMembership = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const request = async () => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/membership/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to cancel");
    return response.json();
  };

  const { mutateAsync: cancel, isLoading } = useMutation(request, {
    onSuccess: () => {
      toast.success("Membership cancelled");
      queryClient.invalidateQueries("fetchMembership");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { cancel, isLoading };
};
