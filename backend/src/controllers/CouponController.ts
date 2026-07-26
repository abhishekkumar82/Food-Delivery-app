import { Request, Response } from "express";
import Coupon from "../models/coupon";

// Shared discount calculator (also used by OrderController at checkout).
// Returns the discount in minor units, capped at the subtotal.
export const computeDiscount = (coupon: any, subtotal: number): number => {
  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }
  return Math.max(0, Math.min(discount, subtotal));
};

// Validate a coupon against a given subtotal / restaurant without consuming it.
// Body: { code, subtotal (minor units), restaurantId? }
const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal, restaurantId } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: String(code).toUpperCase().trim(),
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }
    if (
      coupon.usageLimit &&
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({ message: "This coupon is no longer available" });
    }
    if (
      coupon.restaurant &&
      restaurantId &&
      coupon.restaurant.toString() !== restaurantId
    ) {
      return res
        .status(400)
        .json({ message: "This coupon isn't valid for this restaurant" });
    }
    const sub = Number(subtotal) || 0;
    if (coupon.minOrderAmount && sub < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Add items worth ${(
          (coupon.minOrderAmount - sub) /
          100
        ).toFixed(2)} more to use this coupon`,
      });
    }

    const discountAmount = computeDiscount(coupon, sub);

    res.json({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      value: coupon.value,
      discountAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// Publicly list active, non-expired coupons (for a "available offers" strip).
const getActiveCoupons = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
    }).select("code description discountType value minOrderAmount maxDiscount expiresAt");
    res.json(coupons);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// Dev helper: seed a few demo coupons (idempotent by code).
const seedCoupons = async (_req: Request, res: Response) => {
  try {
    const samples = [
      {
        code: "WELCOME50",
        description: "50% off your first order (up to £10)",
        discountType: "percent",
        value: 50,
        minOrderAmount: 1000,
        maxDiscount: 1000,
      },
      {
        code: "SAVE20",
        description: "20% off orders over £15",
        discountType: "percent",
        value: 20,
        minOrderAmount: 1500,
        maxDiscount: 800,
      },
      {
        code: "FLAT5",
        description: "£5 off orders over £20",
        discountType: "flat",
        value: 500,
        minOrderAmount: 2000,
      },
    ];

    for (const s of samples) {
      await Coupon.findOneAndUpdate({ code: s.code }, s, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    const coupons = await Coupon.find({ code: { $in: samples.map((s) => s.code) } });
    res.json({ message: "seeded", coupons });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  validateCoupon,
  getActiveCoupons,
  seedCoupons,
};
