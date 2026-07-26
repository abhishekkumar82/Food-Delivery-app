import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import CartController from "../controllers/CartController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, CartController.getMyCart);
router.put("/", jwtCheck, jwtParse, CartController.updateMyCart);
router.delete("/", jwtCheck, jwtParse, CartController.clearMyCart);

export default router;
