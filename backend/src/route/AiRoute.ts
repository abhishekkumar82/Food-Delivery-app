import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateAiSearchRequest } from "../middleware/validation";
import AiController from "../controllers/AiController";

const router = express.Router();

router.get(
  "/recommendations",
  jwtCheck,
  jwtParse,
  AiController.getRecommendations
);
router.post("/search", validateAiSearchRequest, AiController.nlSearch); // public
router.get("/review-summary/:restaurantId", AiController.reviewSummary); // public

export default router;
