import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import GamificationController from "../controllers/GamificationController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, GamificationController.getMyGamification);

export default router;
