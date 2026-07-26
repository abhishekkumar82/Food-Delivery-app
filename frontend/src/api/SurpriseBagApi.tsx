import { SurpriseBag } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// public browse — no auth required
export const useGetSurpriseBags = () => {
  const request = async (): Promise<SurpriseBag[]> => {
    const response = await fetch(`${API_BASE_URL}/api/surprise-bags`);
    if (!response.ok) throw new Error("Failed to fetch surprise bags");
    return response.json();
  };
  const { data: bags, isLoading } = useQuery("fetchSurpriseBags", request);
  return { bags, isLoading };
};

export const useGetMySurpriseBags = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const request = async (): Promise<SurpriseBag[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/surprise-bags/my`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch your surprise bags");
    return response.json();
  };
  const { data: bags, isLoading } = useQuery("fetchMySurpriseBags", request, {
    enabled: isAuthenticated,
  });
  return { bags, isLoading };
};

export const useCreateSurpriseBag = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const request = async (bag: Partial<SurpriseBag>) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/surprise-bags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bag),
    });
    if (!response.ok) throw new Error("Failed to create surprise bag");
    return response.json();
  };
  const { mutateAsync: createBag, isLoading } = useMutation(request, {
    onSuccess: () => {
      toast.success("Surprise bag published");
      queryClient.invalidateQueries("fetchMySurpriseBags");
      queryClient.invalidateQueries("fetchSurpriseBags");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { createBag, isLoading };
};

export const useDeleteSurpriseBag = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const request = async (id: string) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/surprise-bags/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to delete");
    return response.json();
  };
  const { mutateAsync: deleteBag } = useMutation(request, {
    onSuccess: () => {
      toast.success("Removed");
      queryClient.invalidateQueries("fetchMySurpriseBags");
      queryClient.invalidateQueries("fetchSurpriseBags");
    },
  });
  return { deleteBag };
};

export const useClaimSurpriseBag = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const request = async (id: string) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/surprise-bags/${id}/claim`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to claim");
    return data;
  };
  const { mutateAsync: claimBag, isLoading } = useMutation(request, {
    onSuccess: () => {
      toast.success("Reserved! Check notifications for pickup details 🎁");
      queryClient.invalidateQueries("fetchSurpriseBags");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { claimBag, isLoading };
};
