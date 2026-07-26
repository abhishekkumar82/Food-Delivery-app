import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/review";
import Restaurant from "../models/restaurant";
import Order from "../models/order";

// Recompute and persist the average rating + count for a restaurant (menuItemId
// null) or for a specific dish within that restaurant.
const recalcAggregates = async (
  restaurantId: mongoose.Types.ObjectId | string,
  menuItemId: string | null
) => {
  const match: any = { restaurant: new mongoose.Types.ObjectId(restaurantId) };
  match.menuItemId = menuItemId ?? null;

  const result = await Review.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = result[0]?.avg ? Math.round(result[0].avg * 10) / 10 : 0;
  const count = result[0]?.count ?? 0;

  if (menuItemId) {
    await Restaurant.updateOne(
      { _id: restaurantId, "menuItems._id": menuItemId },
      {
        $set: {
          "menuItems.$.averageRating": avg,
          "menuItems.$.reviewCount": count,
        },
      }
    );
  } else {
    await Restaurant.updateOne(
      { _id: restaurantId },
      { $set: { averageRating: avg, reviewCount: count } }
    );
  }
};

// GET /api/restaurant/:restaurantId/reviews  (public)
const getRestaurantReviews = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const menuItemId = (req.query.menuItemId as string) || null;

    const filter: any = { restaurant: restaurantId };
    if (menuItemId) {
      filter.menuItemId = menuItemId;
    } else {
      filter.menuItemId = null;
    }

    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/restaurant/:restaurantId/reviews  (auth)
const createReview = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { rating, comment, menuItemId, orderId, imageUrls } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    // verified-purchase check: has this user a delivered order here?
    let verifiedOrder = null;
    if (orderId) {
      verifiedOrder = await Order.findOne({
        _id: orderId,
        user: req.userId,
        restaurant: restaurantId,
      });
    }

    const review = new Review({
      restaurant: restaurantId,
      user: req.userId,
      order: verifiedOrder?._id,
      menuItemId: menuItemId || null,
      rating,
      comment: comment || "",
      imageUrls: imageUrls || [],
    });

    await review.save();

    if (verifiedOrder && !verifiedOrder.isReviewed) {
      verifiedOrder.isReviewed = true;
      await verifiedOrder.save();
    }

    await recalcAggregates(restaurantId, menuItemId || null);

    const populated = await review.populate("user", "name");
    res.status(201).json(populated);
  } catch (error: any) {
    // duplicate review (unique index) -> 409
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this." });
    }
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PUT /api/restaurant/:restaurantId/reviews/:reviewId  (auth, owner only)
const updateReview = async (req: Request, res: Response) => {
  try {
    const { restaurantId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId, user: req.userId });
    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await recalcAggregates(restaurantId, review.menuItemId || null);
    res.json(review);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/restaurant/:restaurantId/reviews/:reviewId  (auth, owner only)
const deleteReview = async (req: Request, res: Response) => {
  try {
    const { restaurantId, reviewId } = req.params;
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: req.userId,
    });
    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }
    await recalcAggregates(restaurantId, review.menuItemId || null);
    res.status(200).json({ message: "review deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  getRestaurantReviews,
  createReview,
  updateReview,
  deleteReview,
};
