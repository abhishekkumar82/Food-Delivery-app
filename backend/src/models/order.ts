import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // ---- Tier 1: rider/driver assignment ----
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    // geo for live tracking / distance
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  cartItems: [
    {
      menuItemId: { type: String, required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
      // capture chosen add-ons at order time
      addOns: [
        {
          name: { type: String },
          price: { type: Number },
        },
      ],
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: [
      "placed",
      "paid",
      "confirmed",
      "inProgress",
      "readyForPickup",
      "outForDelivery",
      "delivered",
      "cancelled",
    ],
    default: "placed",
  },
  // ---- Tier 1: has the customer reviewed this order yet? ----
  isReviewed: { type: Boolean, default: false },
  // ---- Tier 2: payment method, coupon, wallet, scheduling ----
  paymentMethod: {
    type: String,
    enum: ["card", "cod", "upi", "wallet"],
    default: "card",
  },
  coupon: {
    code: { type: String },
    discountAmount: { type: Number, default: 0 }, // minor units
  },
  walletApplied: { type: Number, default: 0 }, // minor units redeemed from wallet
  // ---- Tier 3: membership perks applied to this order ----
  memberDiscount: { type: Number, default: 0 }, // minor units off from membership
  freeDelivery: { type: Boolean, default: false },
  // ---- Tier 3: sustainability ----
  ecoPackaging: { type: Boolean, default: false }, // opted for eco-friendly packaging
  carbonGrams: { type: Number, default: 0 }, // estimated CO2 footprint of this order
  loyaltyEarned: { type: Number, default: 0 },
  loyaltyAwarded: { type: Boolean, default: false },
  scheduledFor: { type: Date }, // null/undefined = ASAP
  // live-tracking snapshot of the driver's position for this order
  driverLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },
  // audit trail of status transitions (used by tracking timeline)
  statusHistory: {
    type: [
      new mongoose.Schema(
        {
          status: { type: String, required: true },
          at: { type: Date, default: Date.now },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
