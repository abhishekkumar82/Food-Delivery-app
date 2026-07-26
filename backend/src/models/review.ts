import mongoose from "mongoose";

// A review can target the restaurant as a whole, and optionally a specific dish.
const reviewSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // links the review to a delivered order (verified-purchase badge)
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  // if set, this is a per-dish review; otherwise it's a restaurant review
  menuItemId: { type: String, default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  imageUrls: { type: [String], default: [] }, // photo reviews
  createdAt: { type: Date, default: Date.now },
});

// one review per user per restaurant per dish (null menuItemId = restaurant-level)
reviewSchema.index({ user: 1, restaurant: 1, menuItemId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
