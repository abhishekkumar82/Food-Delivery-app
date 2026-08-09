// Mirrors backend/src/config/offers.ts (backend enforces; this drives the UI).
// Amounts in minor units (pence).
export const OFFERS = {
  freeDeliveryMin: 1500, // £15.00 subtotal -> free delivery
  flatMin: 2500, // £25.00 subtotal -> flat off
  flatAmount: 500, // £5.00 off
};

export const autoOffers = (subtotal: number) => ({
  freeDelivery: subtotal >= OFFERS.freeDeliveryMin,
  autoDiscount: subtotal >= OFFERS.flatMin ? OFFERS.flatAmount : 0,
});
