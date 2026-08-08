import { Order, UserRole } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type AdminStats = {
  users: number;
  restaurants: number;
  orders: number;
  totalRevenue: number;
};
export type AdminUser = { _id: string; email: string; name?: string; role: UserRole };
export type AdminRestaurant = {
  _id: string;
  restaurantName: string;
  city: string;
  averageRating?: number;
  reviewCount?: number;
};
export type AdminCoupon = {
  _id: string;
  code: string;
  description?: string;
  discountType: "percent" | "flat";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive?: boolean;
};

// shared authorized fetch helper
const useAuthedFetch = () => {
  const { getAccessTokenSilently } = useAuth0();
  return async (path: string, init: RequestInit = {}) => {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data;
  };
};

export const useAdminStats = () => {
  const authed = useAuthedFetch();
  const { data, isLoading } = useQuery<AdminStats>("adminStats", () =>
    authed("/api/admin/stats")
  );
  return { stats: data, isLoading };
};

export const useAdminUsers = () => {
  const authed = useAuthedFetch();
  const { data, isLoading } = useQuery<AdminUser[]>("adminUsers", () =>
    authed("/api/admin/users")
  );
  return { users: data, isLoading };
};

export const useUpdateUserRole = () => {
  const authed = useAuthedFetch();
  const queryClient = useQueryClient();
  const { mutateAsync: updateRole } = useMutation(
    ({ id, role }: { id: string; role: UserRole }) =>
      authed(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    {
      onSuccess: () => {
        toast.success("Role updated");
        queryClient.invalidateQueries("adminUsers");
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
  return { updateRole };
};

export const useAdminRestaurants = () => {
  const authed = useAuthedFetch();
  const { data, isLoading } = useQuery<AdminRestaurant[]>(
    "adminRestaurants",
    () => authed("/api/admin/restaurants")
  );
  return { restaurants: data, isLoading };
};

export const useDeleteRestaurant = () => {
  const authed = useAuthedFetch();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteRestaurant } = useMutation(
    (id: string) => authed(`/api/admin/restaurants/${id}`, { method: "DELETE" }),
    {
      onSuccess: () => {
        toast.success("Restaurant deleted");
        queryClient.invalidateQueries("adminRestaurants");
        queryClient.invalidateQueries("adminStats");
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
  return { deleteRestaurant };
};

export const useAdminOrders = () => {
  const authed = useAuthedFetch();
  const { data, isLoading } = useQuery<Order[]>("adminOrders", () =>
    authed("/api/admin/orders")
  );
  return { orders: data, isLoading };
};

export const useAdminCoupons = () => {
  const authed = useAuthedFetch();
  const { data, isLoading } = useQuery<AdminCoupon[]>("adminCoupons", () =>
    authed("/api/admin/coupons")
  );
  return { coupons: data, isLoading };
};

export const useCreateCoupon = () => {
  const authed = useAuthedFetch();
  const queryClient = useQueryClient();
  const { mutateAsync: createCoupon, isLoading } = useMutation(
    (coupon: Partial<AdminCoupon>) =>
      authed("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify(coupon),
      }),
    {
      onSuccess: () => {
        toast.success("Coupon saved");
        queryClient.invalidateQueries("adminCoupons");
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
  return { createCoupon, isLoading };
};

export const useDeleteCoupon = () => {
  const authed = useAuthedFetch();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteCoupon } = useMutation(
    (id: string) => authed(`/api/admin/coupons/${id}`, { method: "DELETE" }),
    {
      onSuccess: () => {
        toast.success("Coupon deleted");
        queryClient.invalidateQueries("adminCoupons");
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
  return { deleteCoupon };
};
