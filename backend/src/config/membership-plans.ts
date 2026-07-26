// ---- Tier 3: membership plans (Zomato-Gold style) ----
// Prices are in minor units (pence). durationDays = validity of one purchase.
export type MembershipPlanId = "gold" | "pro";

export type MembershipPlan = {
  id: MembershipPlanId;
  name: string;
  price: number; // minor units
  durationDays: number;
  discountPercent: number; // extra % off every order subtotal
  freeDelivery: boolean;
  perks: string[];
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "gold",
    name: "Gold",
    price: 9900, // £99
    durationDays: 30,
    discountPercent: 10,
    freeDelivery: true,
    perks: ["Free delivery on every order", "10% off all orders", "Member-only deals"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19900, // £199
    durationDays: 90,
    discountPercent: 15,
    freeDelivery: true,
    perks: [
      "Free delivery on every order",
      "15% off all orders",
      "Priority support",
      "Early access to surprise bags",
    ],
  },
];

export const getPlan = (id: string): MembershipPlan | undefined =>
  MEMBERSHIP_PLANS.find((p) => p.id === id);
