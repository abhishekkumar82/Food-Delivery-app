import express from "express";
import { param } from "express-validator";
import Restaurant from "../models/restaurant";
import RestaurantController from "../controllers/RestaurantController";

const router=express.Router();


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
