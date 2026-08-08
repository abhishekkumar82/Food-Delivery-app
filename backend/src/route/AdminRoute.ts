import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import AdminController from "../controllers/AdminController";

const router = express.Router();

// every admin route requires an authenticated admin
router.use(jwtCheck, jwtParse, requireRole("admin"));

router.get("/stats", AdminController.getStats);
router.get("/users", AdminController.listUsers);
router.patch("/users/:id/role", AdminController.updateUserRole);
router.get("/restaurants", AdminController.listRestaurants);
router.delete("/restaurants/:id", AdminController.deleteRestaurant);
router.get("/orders", AdminController.listOrders);
router.get("/coupons", AdminController.listCoupons);
router.post("/coupons", AdminController.createCoupon);
router.delete("/coupons/:id", AdminController.deleteCoupon);

export default router;
