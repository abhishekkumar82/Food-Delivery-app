import { useGetPartnerStatus, usePayPartnerFee } from "@/api/PartnerApi";
import { Button } from "@/components/ui/button";
import { BarChart3, Bike, Store, UtensilsCrossed } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const perks = [
  { icon: UtensilsCrossed, text: "Publish your menu with photos, veg/non-veg & bestseller tags" },
  { icon: BarChart3, text: "Track revenue, orders and top items in a live analytics dashboard" },
  { icon: Bike, text: "Manage incoming orders and assign delivery riders" },
];

const PartnerPage = () => {
  const { status, isLoading } = useGetPartnerStatus();
  const { payFee, isLoading: isPaying } = usePayPartnerFee();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get("cancelled")) {
      toast.error("Payment cancelled — you can try again anytime.");
    }
  }, [params]);

  const handlePay = async () => {
    const data = await payFee();
    if (data.url) {
      window.location.href = data.url; // off to Stripe checkout
    } else if (data.alreadyPaid) {
      navigate("/manage-restaurant");
    }
  };

  const fee = status?.fee ?? 0;
  const symbol = status?.currency === "inr" ? "₹" : "";
  const alreadyPaid = status?.paid;

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

      {isLoading ? (
        <span>Loading...</span>
      ) : alreadyPaid ? (
        <>
          <p className="text-sm font-semibold text-green-600">
            ✓ Registration fee paid — you're all set!
          </p>
          <Button
            className="bg-orange-500"
            onClick={() => navigate("/manage-restaurant")}
          >
            List your restaurant
          </Button>
        </>
      ) : (
        <>
          {fee > 0 && (
            <div className="rounded-lg bg-orange-50 px-6 py-3">
              <span className="text-sm text-gray-600">One-time registration fee</span>
              <p className="text-2xl font-bold text-orange-600">
                {symbol}
                {fee}
              </p>
            </div>
          )}
          <Button className="bg-orange-500" disabled={isPaying} onClick={handlePay}>
            {isPaying
              ? "Redirecting..."
              : fee > 0
              ? `Pay ${symbol}${fee} & Register`
              : "Register your restaurant"}
          </Button>
          <p className="text-xs text-gray-400">
            You'll become a restaurant partner as soon as the payment succeeds.
          </p>
        </>
      )}
    </div>
  );
};

export default PartnerPage;
