import { AppliedCoupon, Coupon } from "@/types";
import { useMutation, useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetActiveCoupons = () => {
  const getCouponsRequest = async (): Promise<Coupon[]> => {
    const response = await fetch(`${API_BASE_URL}/api/coupon`);
    if (!response.ok) throw new Error("Failed to fetch coupons");
    return response.json();
  };
  const { data: coupons, isLoading } = useQuery("activeCoupons", getCouponsRequest);
  return { coupons, isLoading };
};

type ValidateArgs = {
  code: string;
  subtotal: number;
  restaurantId?: string;
};

export const useValidateCoupon = () => {
  const validateRequest = async (args: ValidateArgs): Promise<AppliedCoupon> => {
    const response = await fetch(`${API_BASE_URL}/api/coupon/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid coupon");
    }
    return data;
  };

  const { mutateAsync: validateCoupon, isLoading } = useMutation(validateRequest);
  return { validateCoupon, isLoading };
};
