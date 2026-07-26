import express from "express";
import MyUserController from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router=express.Router();
router.get("/",jwtCheck,jwtParse,MyUserController.getCurrentUser);
router.post("/",jwtCheck,MyUserController.createCurrentUser);
router.put("/",jwtCheck,jwtParse,validateMyUserRequest,MyUserController.updateCurrentUser);

// ---- Tier 1: address book ----
router.get("/addresses",jwtCheck,jwtParse,MyUserController.getAddresses);
router.post("/addresses",jwtCheck,jwtParse,MyUserController.addAddress);
router.put("/addresses/:addressId",jwtCheck,jwtParse,MyUserController.updateAddress);
router.delete("/addresses/:addressId",jwtCheck,jwtParse,MyUserController.deleteAddress);

export default router;