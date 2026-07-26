import mongoose from "mongoose";

// Tier 2: promo codes / coupons
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: { type: String, default: "" },
  // "percent" => value is a % (e.g. 20 = 20% off). "flat" => value is minor units off.
  discountType: {
    type: String,
    enum: ["percent", "flat"],
    required: true,
  },
  value: { type: Number, required: true },
  // order subtotal (minor units) required before the coupon applies
  minOrderAmount: { type: Number, default: 0 },
  // cap on the discount for percent coupons (minor units, 0 = no cap)
  maxDiscount: { type: Number, default: 0 },
  // optional scoping to a single restaurant
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
