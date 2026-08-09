// ---- Automatic order offers (applied by subtotal, no coupon code needed) ----
// Amounts are in minor units (pence). App displays GBP (£).
export const OFFERS = {
  freeDeliveryMin: 1500, // subtotal >= £15.00 -> free delivery
  flatDiscount: { min: 2500, amount: 500 }, // subtotal >= £25.00 -> £5.00 off
};

export const computeAutoOffers = (subtotal: number) => ({
  freeDelivery: subtotal >= OFFERS.freeDeliveryMin,
  flatDiscount:
    subtotal >= OFFERS.flatDiscount.min ? OFFERS.flatDiscount.amount : 0,
});
