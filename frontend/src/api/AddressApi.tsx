import { Address } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetMyAddresses = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getAddressesRequest = async (): Promise<Address[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user/addresses`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch addresses");
    }
    return response.json();
  };

  const { data: addresses, isLoading } = useQuery(
    "fetchMyAddresses",
    getAddressesRequest
  );
  return { addresses, isLoading };
};

export const useAddAddress = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const addAddressRequest = async (
    address: Partial<Address>
  ): Promise<Address[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/api/my/user/addresses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(address),
    });
    if (!response.ok) {
      throw new Error("Failed to add address");
    }
    return response.json();
  };

  const { mutateAsync: addAddress, isLoading } = useMutation(addAddressRequest, {
    onSuccess: () => {
      toast.success("Address added");
      queryClient.invalidateQueries("fetchMyAddresses");
    },
  });

  return { addAddress, isLoading };
};

export const useUpdateAddress = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const updateAddressRequest = async ({
    addressId,
    ...address
  }: Partial<Address> & { addressId: string }): Promise<Address[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/my/user/addresses/${addressId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(address),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update address");
    }
    return response.json();
  };

  const { mutateAsync: updateAddress, isLoading } = useMutation(
    updateAddressRequest,
    {
      onSuccess: () => {
        toast.success("Address updated");
        queryClient.invalidateQueries("fetchMyAddresses");
      },
    }
  );

  return { updateAddress, isLoading };
};

export const useDeleteAddress = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const deleteAddressRequest = async (
    addressId: string
  ): Promise<Address[]> => {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${API_BASE_URL}/api/my/user/addresses/${addressId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete address");
    }
    return response.json();
  };

  const { mutateAsync: deleteAddress, isLoading } = useMutation(
    deleteAddressRequest,
    {
      onSuccess: () => {
        toast.success("Address removed");
        queryClient.invalidateQueries("fetchMyAddresses");
      },
    }
  );

  return { deleteAddress, isLoading };
};
