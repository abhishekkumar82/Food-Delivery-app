import {
  useAddGroupItem,
  useCheckoutGroupOrder,
  useGetGroupOrder,
  useJoinGroupOrder,
  useRemoveGroupItem,
} from "@/api/GroupOrderApi";
import { useGetRestaurant } from "@/api/RestaurantApi";
import { useGetMyUser } from "@/api/MyUserApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Users, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const money = (minor: number) => `£${(minor / 100).toFixed(2)}`;

const GroupOrderPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useGetMyUser();
  const { joinGroup } = useJoinGroupOrder();
  const { group, isLoading } = useGetGroupOrder(code);
  const { addItem } = useAddGroupItem(code || "");
  const { removeItem } = useRemoveGroupItem(code || "");
  const { checkoutGroup, isLoading: isCheckingOut } = useCheckoutGroupOrder(
    code || ""
  );

  // auto-join once when opening an invite link
  const joinedRef = useRef(false);
  useEffect(() => {
    if (joinedRef.current || !code) return;
    joinedRef.current = true;
    joinGroup(code).catch(() => {});
  }, [code, joinGroup]);

  const restaurantId =
    group && typeof group.restaurant === "object"
      ? group.restaurant._id
      : (group?.restaurant as string | undefined);
  const { restaurant } = useGetRestaurant(restaurantId);

  if (isLoading) return <span>Loading group order...</span>;
  if (!group) return <span className="text-gray-500">Group not found.</span>;

  const restaurantName =
    typeof group.restaurant === "object"
      ? group.restaurant.restaurantName
      : "Restaurant";
  const isHost = currentUser?._id === group.host;
  const total = group.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const placed = group.status === "placed";

  const copyCode = () => {
    navigator.clipboard.writeText(group.code);
    toast.success("Invite code copied!");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Users className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Group Order</h1>
          <p className="text-sm text-gray-500">{restaurantName}</p>
        </div>
      </div>

      {/* invite code */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="flex flex-col gap-2 pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-600">Share this code so friends can join:</p>
            <p className="text-3xl font-bold tracking-widest">{group.code}</p>
          </div>
          <Button variant="outline" onClick={copyCode}>
            <Copy size={16} className="mr-1" /> Copy code
          </Button>
        </CardContent>
      </Card>

      {/* members */}
      <div>
        <h2 className="mb-2 text-lg font-bold">
          In this group ({group.members.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {group.members.map((m, i) => (
            <span
              key={i}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium"
            >
              {m.name}
              {m.user === group.host && " 👑"}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* shared cart */}
        <div>
          <h2 className="mb-2 text-lg font-bold">Shared cart</h2>
          {group.items.length === 0 ? (
            <p className="text-sm text-gray-500">
              No items yet. Add something from the menu →
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {group.items.map((item) => {
                const canRemove =
                  isHost || item.addedBy === currentUser?._id;
                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        by {item.addedByName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{money(item.price * item.quantity)}</span>
                      {canRemove && !placed && (
                        <X
                          size={16}
                          className="cursor-pointer text-red-400"
                          onClick={() => removeItem(item._id)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          )}

          {isHost && !placed && (
            <Button
              className="mt-4 w-full bg-orange-500"
              disabled={isCheckingOut || group.items.length === 0}
              onClick={async () => {
                const { restaurantId } = await checkoutGroup();
                toast.success("Group cart ready — complete checkout!");
                navigate(`/detail/${restaurantId}`);
              }}
            >
              Order together ({money(total)})
            </Button>
          )}
          {placed && (
            <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              This group order has been sent to checkout by the host. 🎉
            </p>
          )}
          {!isHost && !placed && (
            <p className="mt-4 text-xs text-gray-400">
              Only the host can place the final order.
            </p>
          )}
        </div>

        {/* menu to add from */}
        <div>
          <h2 className="mb-2 text-lg font-bold">Add from menu</h2>
          {!restaurant ? (
            <span className="text-sm text-gray-400">Loading menu...</span>
          ) : (
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
              {restaurant.menuItems.map((mi) => (
                <div
                  key={mi._id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {mi.name}{" "}
                    <span className="text-gray-400">{money(mi.price)}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={placed}
                    onClick={() =>
                      addItem({
                        menuItemId: mi._id,
                        name: mi.name,
                        price: mi.price,
                        quantity: 1,
                      })
                    }
                  >
                    + Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />
      <p className="text-xs text-gray-400">
        The cart refreshes automatically as friends add items.
      </p>
    </div>
  );
};

export default GroupOrderPage;
