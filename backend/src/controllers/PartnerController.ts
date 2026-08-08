import { Request, Response } from "express";
import Stripe from "stripe";
import User from "../models/user";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

const feeRupees = () => Number(process.env.PARTNER_REGISTRATION_FEE) || 0;
const feeCurrency = () => process.env.PARTNER_FEE_CURRENCY || "inr";

// GET /api/my/partner -> fee amount + whether this account has already paid
const getPartnerStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("role partnerFeePaid");
    const isOwner = user?.role === "owner" || user?.role === "admin";
    res.json({
      fee: feeRupees(),
      currency: feeCurrency(),
      paid: !!user?.partnerFeePaid || isOwner,
      isOwner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/my/partner/pay -> Stripe checkout session for the registration fee
const createPartnerPayment = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("role partnerFeePaid");
    if (!user) return res.status(404).json({ message: "User not found" });

    // already an owner/admin or already paid -> nothing to charge
    if (
      user.role === "owner" ||
      user.role === "admin" ||
      user.partnerFeePaid
    ) {
      return res.json({ alreadyPaid: true });
    }

    const fee = feeRupees();
    // no fee configured -> registration is free; unlock immediately
    if (fee <= 0) {
      await User.findByIdAndUpdate(req.userId, { partnerFeePaid: true });
      return res.json({ alreadyPaid: true });
    }

    const session = await STRIPE.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: feeCurrency(),
            unit_amount: fee * 100, // Stripe expects the smallest unit (paise)
            product_data: { name: "Restaurant Partner Registration" },
          },
          quantity: 1,
        },
      ],
      metadata: { type: "partner_fee", userId: req.userId },
      success_url: `${FRONTEND_URL}/manage-restaurant?partner=success`,
      cancel_url: `${FRONTEND_URL}/partner?cancelled=true`,
    });

    if (!session.url) {
      return res.status(500).json({ message: "Error creating payment session" });
    }
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: error?.raw?.message || error?.message || "payment error" });
  }
};

export default { getPartnerStatus, createPartnerPayment };
