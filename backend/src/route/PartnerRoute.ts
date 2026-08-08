import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import PartnerController from "../controllers/PartnerController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, PartnerController.getPartnerStatus);
router.post("/pay", jwtCheck, jwtParse, PartnerController.createPartnerPayment);

export default router;
