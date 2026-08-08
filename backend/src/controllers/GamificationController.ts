import { Request, Response } from "express";
import Order from "../models/order";
import Review from "../models/review";

// A badge definition: `earned` + `progress` are computed from the user's stats.
type BadgeDef = {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  goal: number;
  value: (s: Stats) => number;
};

type Stats = {
  totalOrders: number;
  totalReviews: number;
  distinctRestaurants: number;
  currentStreak: number;
  longestStreak: number;
  totalSpent: number; // minor units
};

const BADGES: BadgeDef[] = [
  { id: "first_order", name: "First Bite", description: "Place your first order", icon: "🍴", goal: 1, value: (s) => s.totalOrders },
  { id: "regular", name: "Regular", description: "Place 5 orders", icon: "🥡", goal: 5, value: (s) => s.totalOrders },
  { id: "foodie", name: "Foodie", description: "Place 25 orders", icon: "🍔", goal: 25, value: (s) => s.totalOrders },
  { id: "explorer", name: "Explorer", description: "Order from 5 different restaurants", icon: "🧭", goal: 5, value: (s) => s.distinctRestaurants },
  { id: "reviewer", name: "Reviewer", description: "Write 3 reviews", icon: "✍️", goal: 3, value: (s) => s.totalReviews },
  { id: "critic", name: "Critic", description: "Write 10 reviews", icon: "⭐", goal: 10, value: (s) => s.totalReviews },
  { id: "streak_3", name: "On a Roll", description: "3-day order streak", icon: "🔥", goal: 3, value: (s) => s.longestStreak },
  { id: "streak_7", name: "Streak Master", description: "7-day order streak", icon: "⚡", goal: 7, value: (s) => s.longestStreak },
  { id: "big_spender", name: "Big Spender", description: "Spend £250 in total", icon: "💎", goal: 25000, value: (s) => s.totalSpent },
];

// consecutive-calendar-day streak from a set of order day-strings (YYYY-MM-DD)
export const computeStreaks = (dayKeys: string[]) => {
  const uniqueDays = Array.from(new Set(dayKeys)).sort(); // ascending
  if (uniqueDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dayNumber = (key: string) => Math.floor(new Date(key).getTime() / 86400000);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (dayNumber(uniqueDays[i]) - dayNumber(uniqueDays[i - 1]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // current streak counts back from today (or yesterday, to allow "not yet today")
  const todayNum = Math.floor(Date.now() / 86400000);
  const lastNum = dayNumber(uniqueDays[uniqueDays.length - 1]);
  let current = 0;
  if (todayNum - lastNum <= 1) {
    current = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      if (dayNumber(uniqueDays[i]) - dayNumber(uniqueDays[i - 1]) === 1) current += 1;
      else break;
    }
  }
  return { currentStreak: current, longestStreak: longest };
};

// GET /api/my/gamification
const getMyGamification = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId }).select(
      "restaurant totalAmount createdAt status"
    );
    const totalReviews = await Review.countDocuments({ user: req.userId });

    const paidOrders = orders.filter((o) => o.status !== "cancelled");
    const totalOrders = paidOrders.length;
    const distinctRestaurants = new Set(
      paidOrders.map((o) => o.restaurant?.toString()).filter(Boolean)
    ).size;
    const totalSpent = paidOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const dayKeys = paidOrders.map((o) =>
      new Date(o.createdAt as any).toISOString().slice(0, 10)
    );
    const { currentStreak, longestStreak } = computeStreaks(dayKeys);

    const stats: Stats = {
      totalOrders,
      totalReviews,
      distinctRestaurants,
      currentStreak,
      longestStreak,
      totalSpent,
    };

    const badges = BADGES.map((b) => {
      const value = b.value(stats);
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        earned: value >= b.goal,
        progress: Math.min(value, b.goal),
        goal: b.goal,
      };
    });

    // XP + level derived from activity
    const xp = totalOrders * 10 + totalReviews * 5 + distinctRestaurants * 3;
    const level = Math.floor(xp / 100) + 1;
    const xpIntoLevel = xp % 100;

    res.json({
      level,
      xp,
      xpIntoLevel,
      xpForNextLevel: 100,
      currentStreak,
      longestStreak,
      stats,
      badges,
      earnedCount: badges.filter((b) => b.earned).length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default { getMyGamification };
