import { Request, Response } from "express";
import User from "../models/user";
import { MEMBERSHIP_PLANS, getPlan } from "../config/membership-plans";
import { notify } from "../lib/notify";

// Is a user's membership currently valid? (also auto-expires stale ones)
export const getActiveMembership = (user: any) => {
  const m = user?.membership;
  if (!m || !m.active || m.plan === "none") return null;
  if (m.expiresAt && new Date(m.expiresAt).getTime() < Date.now()) return null;
  return m;
};

// Perks used by checkout: free delivery + extra discount percentage.
export const getMembershipPerks = async (userId: string) => {
  const user = await User.findById(userId).select("membership");
  const active = getActiveMembership(user);
  if (!active) return { freeDelivery: false, discountPercent: 0 };
  const plan = getPlan(active.plan);
  return {
    freeDelivery: plan?.freeDelivery ?? false,
    discountPercent: plan?.discountPercent ?? 0,
  };
};

// GET /api/my/membership -> current status + available plans
const getMyMembership = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("membership wallet");
    if (!user) return res.status(404).json({ message: "User not found" });
    const active = getActiveMembership(user);
    res.json({
      membership: {
        plan: user.membership?.plan ?? "none",
        active: !!active,
        startedAt: user.membership?.startedAt,
        expiresAt: user.membership?.expiresAt,
      },
      walletBalance: user.wallet?.balance ?? 0,
      plans: MEMBERSHIP_PLANS,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/my/membership/subscribe { planId }
// Pays from wallet when there are funds; otherwise treats it as a simulated
// payment (demo) so the flow is always exercisable.
const subscribe = async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    const plan = getPlan(planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const balance = user.wallet?.balance ?? 0;
    let paidFromWallet = 0;
    if (balance >= plan.price) {
      paidFromWallet = plan.price;
      user.wallet = { balance: balance - plan.price } as any;
      user.walletTransactions.push({
        type: "debit",
        amount: plan.price,
        reason: `${plan.name} membership`,
      } as any);
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + plan.durationDays);

    user.membership = {
      plan: plan.id,
      active: true,
      startedAt: now,
      expiresAt: expires,
    } as any;

    await user.save();

    await notify({
      userId: req.userId,
      title: `Welcome to ${plan.name}!`,
      message: paidFromWallet
        ? `Your ${plan.name} membership is active until ${expires.toDateString()}.`
        : `Your ${plan.name} membership is active (demo) until ${expires.toDateString()}.`,
      type: "system",
    });

    res.json({
      message: "Subscribed",
      membership: user.membership,
      paidFromWallet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/my/membership/cancel
const cancel = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.membership = {
      plan: "none",
      active: false,
    } as any;
    await user.save();
    res.json({ message: "Membership cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default { getMyMembership, subscribe, cancel };
