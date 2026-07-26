import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import SustainabilityController from "../controllers/SustainabilityController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, SustainabilityController.getMySustainability);

export default router;
