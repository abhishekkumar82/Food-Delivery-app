import { Button } from "@/components/ui/button";
import { BarChart3, Bike, Store, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const perks = [
  { icon: UtensilsCrossed, text: "Publish your menu with photos, veg/non-veg & bestseller tags" },
  { icon: BarChart3, text: "Track revenue, orders and top items in a live analytics dashboard" },
  { icon: Bike, text: "Manage incoming orders and assign delivery riders" },
];

const PartnerPage = () => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-14 text-center">
      <Store size={48} className="text-orange-500" />
      <h1 className="text-3xl font-bold">Partner with MernEats</h1>
      <p className="text-gray-600">
        List your restaurant, reach more customers, and manage everything —
        menu, orders, analytics and delivery — in one place.
      </p>

      <div className="flex w-full flex-col gap-3 text-left">
        {perks.map((p, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
            <p.icon className="shrink-0 text-orange-500" />
            <span className="text-sm text-gray-700">{p.text}</span>
          </div>
        ))}
      </div>

      <Link to="/manage-restaurant">
        <Button className="mt-2 bg-orange-500">List your restaurant</Button>
      </Link>
      <p className="text-xs text-gray-400">
        You'll become a restaurant partner as soon as you create your restaurant.
      </p>
    </div>
  );
};

export default PartnerPage;
