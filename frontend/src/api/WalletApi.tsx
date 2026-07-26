import { WalletInfo } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetWallet = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getWalletRequest = async (): Promise<WalletInfo> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user/wallet`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to fetch wallet");
    return response.json();
  };

  const { data: wallet, isLoading } = useQuery("fetchWallet", getWalletRequest, {
    enabled: isAuthenticated,
  });
  return { wallet, isLoading };
};

export const useRedeemLoyalty = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const redeemRequest = async (points: number) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user/wallet/redeem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ points }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Redeem failed");
    return data;
  };

  const { mutateAsync: redeemLoyalty, isLoading } = useMutation(redeemRequest, {
    onSuccess: () => {
      toast.success("Points redeemed to wallet");
      queryClient.invalidateQueries("fetchWallet");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  return { redeemLoyalty, isLoading };
};
