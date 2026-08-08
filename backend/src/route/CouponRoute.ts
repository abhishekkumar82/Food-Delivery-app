import express from "express";
import CouponController from "../controllers/CouponController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// public offers strip
router.get("/", CouponController.getActiveCoupons);
// validate a code against a subtotal
router.post("/validate", CouponController.validateCoupon);
// dev-only seeding helper — requires auth and is disabled in production
router.post("/seed", jwtCheck, jwtParse, CouponController.seedCoupons);

export default router;
