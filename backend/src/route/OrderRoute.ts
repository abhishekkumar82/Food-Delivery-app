import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";

const router=express.Router();
router.get("/",jwtCheck,jwtParse,OrderController.getMyOrders)
router.get("/:orderId",jwtCheck,jwtParse,OrderController.getMyOrder);
router.post("/checkout/create-checkout-session",jwtCheck,jwtParse,OrderController.createCheckoutSession);
// ---- Tier 2: cash-on-delivery / UPI checkout & reorder ----
router.post("/checkout/cod",jwtCheck,jwtParse,OrderController.createCodOrder);
router.post("/reorder/:orderId",jwtCheck,jwtParse,OrderController.reorder);
router.post("/:orderId/cancel",jwtCheck,jwtParse,OrderController.cancelOrder);
router.post("/checkout/webhook",OrderController.stripeWebhookHandler);
export default router;