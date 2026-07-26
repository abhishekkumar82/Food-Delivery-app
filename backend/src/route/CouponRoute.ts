import express from "express";
import CouponController from "../controllers/CouponController";

const router = express.Router();

// public offers strip
router.get("/", CouponController.getActiveCoupons);
// validate a code against a subtotal
router.post("/validate", CouponController.validateCoupon);
// dev-only seeding helper
router.post("/seed", CouponController.seedCoupons);

export default router;
