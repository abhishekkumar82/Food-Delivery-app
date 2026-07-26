import { useClaimSurpriseBag, useGetSurpriseBags } from "@/api/SurpriseBagApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth0 } from "@auth0/auth0-react";
import { Clock, ShoppingBag } from "lucide-react";

const money = (minor: number) => `£${(minor / 100).toFixed(2)}`;

const SurpriseBagsPage = () => {
  const { bags, isLoading } = useGetSurpriseBags();
  const { claimBag, isLoading: isClaiming } = useClaimSurpriseBag();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (isLoading) return <span>Loading surprise bags...</span>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShoppingBag className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">Surprise Bags</h1>
          <p className="text-sm text-gray-500">
            Rescue surplus food at a discount — pay at pickup, help cut waste. 🌍
          </p>
        </div>
      </div>

      {!bags || bags.length === 0 ? (
        <p className="text-gray-500">
          No surprise bags available right now. Check back near closing time!
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bags.map((bag) => {
            const restaurant =
              typeof bag.restaurant === "object" ? bag.restaurant : null;
            const discount = Math.round(
              (1 - bag.price / bag.originalPrice) * 100
            );
            return (
              <Card key={bag._id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{bag.title}</span>
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                      -{discount}%
                    </span>
                  </CardTitle>
                  {restaurant && (
                    <p className="text-sm text-gray-500">
                      {restaurant.restaurantName} · {restaurant.city}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  {bag.description && (
                    <p className="text-sm text-gray-600">{bag.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} /> Pickup {bag.pickupStart}–{bag.pickupEnd}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{money(bag.price)}</span>
                    <span className="text-sm text-gray-400 line-through">
                      {money(bag.originalPrice)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {bag.quantity} left · {bag.foodType}
                  </span>
                  <Button
                    className="mt-auto bg-green-600 hover:bg-green-700"
                    disabled={isClaiming}
                    onClick={() =>
                      isAuthenticated
                        ? claimBag(bag._id)
                        : loginWithRedirect()
                    }
                  >
                    {isAuthenticated ? "Reserve bag" : "Log in to reserve"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SurpriseBagsPage;
