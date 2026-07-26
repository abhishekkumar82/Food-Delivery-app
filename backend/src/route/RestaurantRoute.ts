import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";
import ReviewController from "../controllers/ReviewController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateReviewRequest } from "../middleware/validation";

const router=express.Router();


// ---- Reviews (nested under a restaurant) ----
// public: read reviews (restaurant-level, or ?menuItemId=... for a dish)
router.get("/:restaurantId/reviews", ReviewController.getRestaurantReviews);
// auth: create / edit / delete your own review
router.post(
  "/:restaurantId/reviews",
  jwtCheck,
  jwtParse,
  validateReviewRequest,
  ReviewController.createReview
);
router.put(
  "/:restaurantId/reviews/:reviewId",
  jwtCheck,
  jwtParse,
  ReviewController.updateReview
);
router.delete(
  "/:restaurantId/reviews/:reviewId",
  jwtCheck,
  jwtParse,
  ReviewController.deleteReview
);


// /api/restaurant/serach/city
router.get("/:restaurantId",
param("restaurantId")
.isString()
.trim()
.notEmpty()
.withMessage("RestaurantId parameter must be a valid string"),
  RestaurantController.getRestaurant
)



router.get("/search/:city",
param("city")
.isString()
.trim()
.notEmpty()
.withMessage("City parameter must be a valid string"),
  RestaurantController.searchRestaurant
);


export default router;
