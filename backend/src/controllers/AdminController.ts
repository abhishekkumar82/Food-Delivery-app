import { Request, Response } from "express";
import User from "../models/user";
import Restaurant from "../models/restaurant";
import Order from "../models/order";
import Coupon from "../models/coupon";

// GET /api/admin/stats -> platform-wide totals
const getStats = async (_req: Request, res: Response) => {
  try {
    const [users, restaurants, orders] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
    ]);
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $nin: ["placed", "cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    res.json({
      users,
      restaurants,
      orders,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/admin/users
const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("email name role").limit(200);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PATCH /api/admin/users/:id/role  { role }
const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!["customer", "owner", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    // an admin cannot change their own role (avoids self-lockout)
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: "You can't change your own role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("email name role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/admin/restaurants
const listRestaurants = async (_req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find()
      .select("restaurantName city averageRating reviewCount user")
      .limit(200);
    res.json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/admin/restaurants/:id
const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ message: "deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/admin/orders -> recent orders across the platform
const listOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("restaurant", "restaurantName")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/admin/coupons
const listCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ _id: -1 });
    res.json(coupons);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/admin/coupons  (upsert by code)
const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, description, discountType, value, minOrderAmount, maxDiscount } =
      req.body;
    if (!code || !["percent", "flat"].includes(discountType) || value == null) {
      return res.status(400).json({ message: "code, discountType and value are required" });
    }
    const normalized = String(code).toUpperCase().trim();
    const coupon = await Coupon.findOneAndUpdate(
      { code: normalized },
      {
        code: normalized,
        description: description || "",
        discountType,
        value: Number(value),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(coupon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/admin/coupons/:id
const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  getStats,
  listUsers,
  updateUserRole,
  listRestaurants,
  deleteRestaurant,
  listOrders,
  listCoupons,
  createCoupon,
  deleteCoupon,
};
