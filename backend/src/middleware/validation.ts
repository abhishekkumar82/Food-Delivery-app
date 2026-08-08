import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];


// export const validateMyRestaurantRequest=[
//   body("resturantName").notEmpty().withMessage('Restaurant name is required'),
//   body("city").notEmpty().withMessage('City name is required'),
//   body("country").notEmpty().withMessage('Country name is required'),
//   body("deliveryPrice").isFloat({min:0}).withMessage("Delivery price must be a positive number "),
//   body("estimatedDeliveryTime").isInt({min:0}).withMessage("Estimated delivery time must be a positive integer"),
//   body("cuisines").isArray().withMessage("Cuisines must be an array").not().isEmpty().withMessage("Cuisines array cannot be empty"),
//   body("menuItems").isArray().withMessage("Menu item name must is required").not().isEmpty().withMessage("Menu items must be an array"),
//   body("menuItems.*.name").notEmpty().withMessage("Menu items name is required"),
//   body("menuItems.*.price").isFloat({min:0}).withMessage("Menu items price  is required and must be a positive number "),
//   handleValidationErrors ,
// ];
export const validateMyRestaurantRequest = [
  body("restaurantName").notEmpty().withMessage("Restaurant name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery price must be a positive number"),
  body("estimatedDeliveryTime")
    .isInt({ min: 0 })
    .withMessage("Estimated delivery time must be a postivie integar"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines array cannot be empty"),
  body("menuItems").isArray().withMessage("Menu items must be an array"),
  body("menuItems.*.name").notEmpty().withMessage("Menu item name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Menu item price is required and must be a postive number"),
  // ---- Tier 1: richer menu items (all optional) ----
  body("menuItems.*.foodType")
    .optional()
    .isIn(["veg", "non-veg", "egg", "vegan"])
    .withMessage("Invalid food type"),
  body("menuItems.*.spiceLevel")
    .optional()
    .isIn(["none", "mild", "medium", "hot", "extra-hot"])
    .withMessage("Invalid spice level"),
  handleValidationErrors,
];

// ---- Tier 1: review validation ----
export const validateReviewRequest = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString(),
  handleValidationErrors,
];

// ---- Tier 3 validators ----
export const validateMembershipRequest = [
  body("planId").isIn(["gold", "pro"]).withMessage("Invalid membership plan"),
  handleValidationErrors,
];

export const validateSurpriseBagRequest = [
  body("title").isString().notEmpty().withMessage("Title is required"),
  body("originalPrice")
    .isInt({ min: 1 })
    .withMessage("Original price must be a positive amount"),
  body("price").isInt({ min: 0 }).withMessage("Price must be a valid amount"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  handleValidationErrors,
];

export const validateGroupCreateRequest = [
  body("restaurantId").isString().notEmpty().withMessage("restaurantId is required"),
  handleValidationErrors,
];

export const validateGroupJoinRequest = [
  body("code").isString().notEmpty().withMessage("Invite code is required"),
  handleValidationErrors,
];

export const validateGroupItemRequest = [
  body("menuItemId").isString().notEmpty(),
  body("name").isString().notEmpty(),
  body("price").isInt({ min: 0 }),
  body("quantity").optional().isInt({ min: 1 }),
  handleValidationErrors,
];

export const validateAiSearchRequest = [
  body("query").isString().notEmpty().withMessage("query is required"),
  handleValidationErrors,
];