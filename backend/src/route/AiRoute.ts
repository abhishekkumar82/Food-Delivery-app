import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import AiController from "../controllers/AiController";

const router = express.Router();

router.get(
  "/recommendations",
  jwtCheck,
  jwtParse,
  AiController.getRecommendations
);
router.post("/search", AiController.nlSearch); // public
router.get("/review-summary/:restaurantId", AiController.reviewSummary); // public

export default router;
