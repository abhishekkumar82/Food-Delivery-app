import { Request, Response } from "express";
import Order from "../models/order";
import SurpriseBag from "../models/surpriseBag";

// GET /api/my/sustainability -> the user's cumulative environmental impact
const getMySustainability = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      user: req.userId,
      status: { $ne: "cancelled" },
    }).select("carbonGrams ecoPackaging");

    const totalOrders = orders.length;
    const totalCarbonGrams = orders.reduce(
      (s, o) => s + (o.carbonGrams || 0),
      0
    );
    const ecoOrders = orders.filter((o) => o.ecoPackaging).length;
    // ~150g CO2 saved per eco-packaging order (less single-use plastic)
    const carbonSavedGrams = ecoOrders * 150;

    // meals rescued via surprise bags claimed by this user
    const mealsRescued = await SurpriseBag.countDocuments({
      "claims.user": req.userId,
    });

    // fun equivalents
    const treesEquivalent = +(carbonSavedGrams / 21000).toFixed(2); // ~21kg/tree/yr
    const kmNotDriven = +(carbonSavedGrams / 170).toFixed(1); // ~170g CO2 per km

    res.json({
      totalOrders,
      ecoOrders,
      mealsRescued,
      totalCarbonKg: +(totalCarbonGrams / 1000).toFixed(2),
      carbonSavedKg: +(carbonSavedGrams / 1000).toFixed(2),
      treesEquivalent,
      kmNotDriven,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default { getMySustainability };
