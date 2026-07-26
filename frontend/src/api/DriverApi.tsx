import { Driver } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetAvailableDrivers = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getDriversRequest = async (): Promise<Driver[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/driver/available`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch drivers");
    }
    return response.json();
  };

  const { data: drivers, isLoading } = useQuery(
    "fetchAvailableDrivers",
    getDriversRequest
  );
  return { drivers, isLoading };
};

export const useCreateDriver = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const createDriverRequest = async (
    driver: Partial<Driver>
  ): Promise<Driver> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/driver`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(driver),
    });
    if (!response.ok) {
      throw new Error("Failed to register driver");
    }
    return response.json();
  };

  const { mutateAsync: createDriver, isLoading } = useMutation(
    createDriverRequest,
    {
      onSuccess: () => {
        toast.success("Driver registered");
        queryClient.invalidateQueries("fetchAvailableDrivers");
      },
    }
  );

  return { createDriver, isLoading };
};

export const useAssignDriver = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const assignDriverRequest = async ({
    orderId,
    driverId,
  }: {
    orderId: string;
    driverId: string;
  }) => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/driver/assign/${orderId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driverId }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to assign driver");
    }
    return response.json();
  };

  const { mutateAsync: assignDriver, isLoading } = useMutation(
    assignDriverRequest,
    {
      onSuccess: () => {
        toast.success("Driver assigned");
        queryClient.invalidateQueries("fetchMyRestaurantOrders");
        queryClient.invalidateQueries("fetchAvailableDrivers");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }
  );

  return { assignDriver, isLoading };
};
