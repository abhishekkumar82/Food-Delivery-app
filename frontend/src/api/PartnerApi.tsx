import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type PartnerStatus = {
  fee: number;
  currency: string;
  paid: boolean;
  isOwner: boolean;
};

export const useGetPartnerStatus = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const request = async (): Promise<PartnerStatus> => {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_BASE_URL}/api/my/partner`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load partner status");
    return res.json();
  };

  const { data: status, isLoading } = useQuery("partnerStatus", request, {
    enabled: isAuthenticated,
  });
  return { status, isLoading };
};

export const usePayPartnerFee = () => {
  const { getAccessTokenSilently } = useAuth0();

  const request = async (): Promise<{ url?: string; alreadyPaid?: boolean }> => {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_BASE_URL}/api/my/partner/pay`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Payment failed");
    return data;
  };

  const { mutateAsync: payFee, isLoading } = useMutation(request, {
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return { payFee, isLoading };
};
