import { Request, Response } from "express";
import SurpriseBag from "../models/surpriseBag";
import Restaurant from "../models/restaurant";
import { notify } from "../lib/notify";

// GET /api/surprise-bags  (public) -> active bags with stock left
const listSurpriseBags = async (_req: Request, res: Response) => {
  try {
    const bags = await SurpriseBag.find({
      isActive: true,
      quantity: { $gt: 0 },
    })
      .populate("restaurant", "restaurantName city imageUrl")
      .sort({ createdAt: -1 });
    res.json(bags);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/surprise-bags/my  (auth, owner) -> bags for the owner's restaurant
const getMySurpriseBags = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    const bags = await SurpriseBag.find({ restaurant: restaurant._id }).sort({
      createdAt: -1,
    });
    res.json(bags);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/surprise-bags  (auth, owner) -> create a bag for the owner's restaurant
const createSurpriseBag = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    const bag = new SurpriseBag({
      ...req.body,
      restaurant: restaurant._id,
      claims: [],
    });
    await bag.save();
    res.status(201).json(bag);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/surprise-bags/:id  (auth, owner)
const deleteSurpriseBag = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    const bag = await SurpriseBag.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurant._id,
    });
    if (!bag) return res.status(404).json({ message: "bag not found" });
    res.json({ message: "deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/surprise-bags/:id/claim  (auth) -> reserve one bag (atomic stock decrement)
const claimSurpriseBag = async (req: Request, res: Response) => {
  try {
    // atomically take one unit only if stock remains
    const bag = await SurpriseBag.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gt: 0 }, isActive: true },
      {
        $inc: { quantity: -1 },
        $push: { claims: { user: req.userId, claimedAt: new Date() } },
      },
      { new: true }
    ).populate("restaurant", "restaurantName city");

    if (!bag) {
      return res.status(409).json({ message: "Sorry, this bag is sold out." });
    }

    const restaurant: any = bag.restaurant;
    await notify({
      userId: req.userId as string,
      title: "Surprise bag reserved! 🎁",
      message: `Pick up "${bag.title}" from ${restaurant?.restaurantName} between ${bag.pickupStart}–${bag.pickupEnd}. Pay at pickup.`,
      type: "promo",
      relatedId: bag._id.toString(),
    });

    res.json({ message: "claimed", bag });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  listSurpriseBags,
  getMySurpriseBags,
  createSurpriseBag,
  deleteSurpriseBag,
  claimSurpriseBag,
};
