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
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
