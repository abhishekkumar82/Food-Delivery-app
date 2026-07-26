import {
  useCreateSurpriseBag,
  useDeleteSurpriseBag,
  useGetMySurpriseBags,
} from "@/api/SurpriseBagApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const money = (minor: number) => `£${(minor / 100).toFixed(2)}`;

const emptyForm = {
  title: "",
  description: "",
  originalPrice: "",
  price: "",
  quantity: "1",
  pickupStart: "18:00",
  pickupEnd: "21:00",
  foodType: "mixed" as "veg" | "non-veg" | "mixed",
};

const ManageSurpriseBagsPage = () => {
  const { bags, isLoading } = useGetMySurpriseBags();
  const { createBag, isLoading: isCreating } = useCreateSurpriseBag();
  const { deleteBag } = useDeleteSurpriseBag();
  const [form, setForm] = useState(emptyForm);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.title || !form.originalPrice || !form.price) return;
    await createBag({
      title: form.title,
      description: form.description,
      originalPrice: Math.round(parseFloat(form.originalPrice) * 100),
      price: Math.round(parseFloat(form.price) * 100),
      quantity: parseInt(form.quantity) || 1,
      pickupStart: form.pickupStart,
      pickupEnd: form.pickupEnd,
      foodType: form.foodType,
    });
    setForm(emptyForm);
  };

  if (isLoading) return <span>Loading...</span>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manage Surprise Bags</h1>

      {/* create */}
      <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-6">
        <h2 className="text-lg font-bold">Publish a new surprise bag</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Bakery surprise box" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Assorted pastries & bread" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Original price (£)</Label>
            <Input value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="15.00" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Discounted price (£)</Label>
            <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="5.00" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Quantity</Label>
            <Input value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="3" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Food type</Label>
            <select value={form.foodType} onChange={(e) => set("foodType", e.target.value)} className="h-10 rounded-md border bg-white px-2 text-sm">
              <option value="mixed">Mixed</option>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Pickup from</Label>
            <Input type="time" value={form.pickupStart} onChange={(e) => set("pickupStart", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Pickup until</Label>
            <Input type="time" value={form.pickupEnd} onChange={(e) => set("pickupEnd", e.target.value)} />
          </div>
        </div>
        <Button className="w-fit bg-green-600 hover:bg-green-700" disabled={isCreating} onClick={handleCreate}>
          {isCreating ? "Publishing..." : "Publish bag"}
        </Button>
      </div>

      <Separator />

      {/* existing */}
      <h2 className="text-lg font-bold">Your surprise bags</h2>
      {!bags || bags.length === 0 ? (
        <p className="text-gray-500">You haven't published any surprise bags yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bags.map((bag) => (
            <Card key={bag._id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{bag.title}</span>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteBag(bag._id)}>
                    Delete
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>
                  {money(bag.price)}{" "}
                  <span className="text-gray-400 line-through">{money(bag.originalPrice)}</span>{" "}
                  · {bag.quantity} left · pickup {bag.pickupStart}–{bag.pickupEnd}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSurpriseBagsPage;
