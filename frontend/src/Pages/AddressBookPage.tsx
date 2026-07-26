import {
  useAddAddress,
  useDeleteAddress,
  useGetMyAddresses,
  useUpdateAddress,
} from "@/api/AddressApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Address } from "@/types";
import { useState } from "react";

const emptyForm = {
  label: "Home" as Address["label"],
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  pincode: "",
  phone: "",
};

const AddressBookPage = () => {
  const { addresses, isLoading } = useGetMyAddresses();
  const { addAddress, isLoading: isAdding } = useAddAddress();
  const { updateAddress } = useUpdateAddress();
  const { deleteAddress } = useDeleteAddress();

  const [form, setForm] = useState(emptyForm);

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAdd = async () => {
    if (!form.addressLine1 || !form.city || !form.country) return;
    await addAddress(form);
    setForm(emptyForm);
  };

  if (isLoading) {
    return <span>Loading addresses...</span>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">My Addresses</h1>

      {/* Saved addresses */}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses && addresses.length > 0 ? (
          addresses.map((address) => (
            <Card key={address._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>
                    {address.label}
                    {address.isDefault && (
                      <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Default
                      </span>
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-gray-600">
                <span>
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </span>
                <span>
                  {address.city}, {address.country} {address.pincode}
                </span>
                {address.phone && <span>📞 {address.phone}</span>}
                <div className="mt-2 flex gap-2">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateAddress({
                          addressId: address._id,
                          isDefault: true,
                        })
                      }
                    >
                      Set default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => deleteAddress(address._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <span className="text-gray-500">No saved addresses yet.</span>
        )}
      </div>

      <Separator />

      {/* Add new address */}
      <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-6">
        <h2 className="text-xl font-bold">Add a new address</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label>Label</Label>
            <select
              value={form.label}
              onChange={(e) => handleChange("label", e.target.value)}
              className="h-10 rounded-md border bg-white px-2 text-sm"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Contact number"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Address line 1</Label>
            <Input
              value={form.addressLine1}
              onChange={(e) => handleChange("addressLine1", e.target.value)}
              placeholder="Flat / house / street"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Address line 2</Label>
            <Input
              value={form.addressLine2}
              onChange={(e) => handleChange("addressLine2", e.target.value)}
              placeholder="Landmark (optional)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Country</Label>
            <Input
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Pincode</Label>
            <Input
              value={form.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />
          </div>
        </div>
        <Button
          className="w-fit bg-orange-500"
          disabled={isAdding}
          onClick={handleAdd}
        >
          {isAdding ? "Saving..." : "Save address"}
        </Button>
      </div>
    </div>
  );
};

export default AddressBookPage;
