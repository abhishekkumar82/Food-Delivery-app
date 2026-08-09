import { OFFERS } from "@/config/offers";

const money = (m: number) => `£${(m / 100).toFixed(2)}`;

// Shows how much more to add to unlock each automatic offer, as the cart grows.
const OffersProgress = ({ subtotal }: { subtotal: number }) => {
  if (subtotal <= 0) return null;

  const tiers = [
    { label: "free delivery", target: OFFERS.freeDeliveryMin },
    { label: `${money(OFFERS.flatAmount)} off`, target: OFFERS.flatMin },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-orange-50/60 p-3 text-sm">
      {tiers.map((t) => {
        const unlocked = subtotal >= t.target;
        const pct = Math.min(100, (subtotal / t.target) * 100);
        return (
          <div key={t.label}>
            <div className="mb-1 flex justify-between">
              <span
                className={
                  unlocked ? "font-semibold text-green-600" : "text-gray-600"
                }
              >
                {unlocked
                  ? `✓ You've unlocked ${t.label}!`
                  : `Add ${money(t.target - subtotal)} more for ${t.label}`}
              </span>
            </div>
            <div className="h-1.5 w-full rounded bg-gray-200">
              <div
                className={`h-1.5 rounded ${
                  unlocked ? "bg-green-500" : "bg-orange-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OffersProgress;
