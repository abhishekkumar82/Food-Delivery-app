import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import User from "../models/user";
import Coupon from "../models/coupon";
import Cart from "../models/cart";
import { computeDiscount } from "./CouponController";
import { getMembershipPerks } from "./MembershipController";
import { applyStatusChange } from "../lib/orderEffects";
import { notify } from "../lib/notify";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user")
      .populate("driver")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// Single order (auth) — used by the live-tracking page.
const getMyOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.userId,
    })
      .populate("restaurant")
      .populate("driver");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

type IncomingCartItem = {
  menuItemId: string;
  name: string;
  quantity: string;
  addOns?: { name: string; price: number }[];
};

type CheckoutSessionRequest = {
  cartItems: IncomingCartItem[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
    location?: { lat?: number; lng?: number };
  };
  restaurantId: string;
  // ---- Tier 2 ----
  couponCode?: string;
  walletApplied?: number; // minor units the user wants to redeem
  scheduledFor?: string; // ISO date string, optional
  paymentMethod?: "card" | "cod" | "upi" | "wallet";
  // ---- Tier 3 ----
  ecoPackaging?: boolean;
};

// Rough CO2 estimate for an order: a base delivery footprint + per-item cost,
// minus a saving when the customer opts into eco-friendly packaging.
const estimateCarbon = (cartItems: IncomingCartItem[], eco?: boolean) => {
  const itemCount = cartItems.reduce(
    (n, ci) => n + (parseInt(ci.quantity) || 0),
    0
  );
  const grams = 500 + itemCount * 200 - (eco ? 150 : 0);
  return Math.max(0, grams);
};

// ---- helpers ----------------------------------------------------------------

const computeSubtotal = (
  cartItems: IncomingCartItem[],
  menuItems: MenuItemType[]
) => {
  return cartItems.reduce((total, cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }
    const addOnsTotal = (cartItem.addOns || []).reduce(
      (s, a) => s + (a.price || 0),
      0
    );
    return total + (menuItem.price + addOnsTotal) * parseInt(cartItem.quantity);
  }, 0);
};

// Is the restaurant currently accepting orders? (open-hours enforcement)
const isRestaurantOpen = (restaurant: any): boolean => {
  if (restaurant.isOpenOverride === "open") return true;
  if (restaurant.isOpenOverride === "closed") return false;

  const hours = restaurant.openingHours;
  if (!hours || hours.length === 0) return true; // no schedule = always open

  const now = new Date();
  const today = hours.find((h: any) => h.day === now.getDay());
  if (!today || today.isClosed) return false;

  const [openH, openM] = String(today.open || "00:00").split(":").map(Number);
  const [closeH, closeM] = String(today.close || "23:59").split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= openH * 60 + openM && mins <= closeH * 60 + closeM;
};

// Resolve coupon + wallet against a subtotal for the given user/restaurant.
// Returns the discount, the wallet amount actually applied, and the coupon doc.
const resolveDiscounts = async (
  userId: string,
  restaurantId: string,
  subtotal: number,
  couponCode?: string,
  walletRequested?: number
) => {
  let discountAmount = 0;
  let couponDoc: any = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase().trim(),
    });
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt.getTime() >= Date.now()) &&
      (!coupon.usageLimit ||
        coupon.usageLimit === 0 ||
        coupon.usedCount < coupon.usageLimit) &&
      (!coupon.restaurant ||
        coupon.restaurant.toString() === restaurantId) &&
      subtotal >= (coupon.minOrderAmount || 0);
    if (valid) {
      discountAmount = computeDiscount(coupon, subtotal);
      couponDoc = coupon;
    }
  }

  let walletApplied = 0;
  if (walletRequested && walletRequested > 0) {
    const user = await User.findById(userId).select("wallet");
    const balance = user?.wallet?.balance ?? 0;
    const remaining = Math.max(0, subtotal - discountAmount);
    walletApplied = Math.min(walletRequested, balance, remaining);
  }

  return { discountAmount, walletApplied, couponDoc };
};

// ---- Stripe webhook ---------------------------------------------------------

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // ---- partner registration fee ----
    if (session.metadata?.type === "partner_fee") {
      if (session.metadata.userId) {
        await User.findByIdAndUpdate(session.metadata.userId, {
          partnerFeePaid: true,
        });
      }
    } else {
      // ---- normal food order ----
      const order = await Order.findById(session.metadata?.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      order.totalAmount = session.amount_total as number;
      // consume wallet + coupon now that payment succeeded
      await finalizeOrderCharges(order);
      await applyStatusChange(order, "paid");
    }
  }

  res.status(200).send();
};

// Deduct redeemed wallet, record the transaction, and bump coupon usage.
const finalizeOrderCharges = async (order: any) => {
  if (order.walletApplied && order.walletApplied > 0 && order.user) {
    await User.findByIdAndUpdate(order.user, {
      $inc: { "wallet.balance": -order.walletApplied },
      $push: {
        walletTransactions: {
          type: "debit",
          amount: order.walletApplied,
          reason: `Redeemed on order ${order._id.toString().slice(-6)}`,
        },
      },
    });
  }
  if (order.coupon?.code) {
    await Coupon.findOneAndUpdate(
      { code: order.coupon.code },
      { $inc: { usedCount: 1 } }
    );
  }
};

// ---- Card checkout (Stripe) -------------------------------------------------

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    if (!isRestaurantOpen(restaurant) && !checkoutSessionRequest.scheduledFor) {
      return res.status(400).json({
        message: "This restaurant is currently closed. Try scheduling your order.",
      });
    }

    const subtotal = computeSubtotal(
      checkoutSessionRequest.cartItems,
      restaurant.menuItems as any
    );
    const { discountAmount, walletApplied, couponDoc } = await resolveDiscounts(
      req.userId,
      restaurant._id.toString(),
      subtotal,
      checkoutSessionRequest.couponCode,
      checkoutSessionRequest.walletApplied
    );

    // ---- Tier 3: membership perks (free delivery + extra % off) ----
    const perks = await getMembershipPerks(req.userId);
    const memberDiscount = Math.round((subtotal * perks.discountPercent) / 100);
    const effectiveDelivery = perks.freeDelivery ? 0 : restaurant.deliveryPrice;

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      paymentMethod: "card",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      coupon: couponDoc
        ? { code: couponDoc.code, discountAmount }
        : { discountAmount: 0 },
      walletApplied,
      memberDiscount,
      freeDelivery: perks.freeDelivery,
      ecoPackaging: !!checkoutSessionRequest.ecoPackaging,
      carbonGrams: estimateCarbon(
        checkoutSessionRequest.cartItems,
        checkoutSessionRequest.ecoPackaging
      ),
      scheduledFor: checkoutSessionRequest.scheduledFor
        ? new Date(checkoutSessionRequest.scheduledFor)
        : undefined,
      statusHistory: [{ status: "placed", at: new Date() }],
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    // Apply coupon + wallet + membership discount as a single one-off Stripe discount.
    const totalOff = discountAmount + walletApplied + memberDiscount;
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (totalOff > 0) {
      const stripeCoupon = await STRIPE.coupons.create({
        amount_off: totalOff,
        currency: "gbp",
        duration: "once",
        name: couponDoc?.code || "Discount",
      });
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      effectiveDelivery,
      restaurant._id.toString(),
      discounts
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }
    await newOrder.save();
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: error.raw?.message || error.message || "checkout error" });
  }
};

// ---- Cash on delivery / UPI / wallet checkout (no Stripe) --------------------

const createCodOrder = async (req: Request, res: Response) => {
  try {
    const body: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(body.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (!isRestaurantOpen(restaurant) && !body.scheduledFor) {
      return res
        .status(400)
        .json({ message: "This restaurant is currently closed." });
    }

    const subtotal = computeSubtotal(body.cartItems, restaurant.menuItems as any);
    const { discountAmount, walletApplied, couponDoc } = await resolveDiscounts(
      req.userId,
      restaurant._id.toString(),
      subtotal,
      body.couponCode,
      body.walletApplied
    );

    // ---- Tier 3: membership perks ----
    const perks = await getMembershipPerks(req.userId);
    const memberDiscount = Math.round((subtotal * perks.discountPercent) / 100);
    const effectiveDelivery = perks.freeDelivery ? 0 : restaurant.deliveryPrice;

    const totalAmount = Math.max(
      0,
      subtotal + effectiveDelivery - discountAmount - walletApplied - memberDiscount
    );

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      paymentMethod: body.paymentMethod === "upi" ? "upi" : "cod",
      deliveryDetails: body.deliveryDetails,
      cartItems: body.cartItems,
      totalAmount,
      coupon: couponDoc ? { code: couponDoc.code, discountAmount } : { discountAmount: 0 },
      walletApplied,
      memberDiscount,
      freeDelivery: perks.freeDelivery,
      ecoPackaging: !!body.ecoPackaging,
      carbonGrams: estimateCarbon(body.cartItems, body.ecoPackaging),
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      statusHistory: [{ status: "placed", at: new Date() }],
      createdAt: new Date(),
    });

    await newOrder.save();
    await finalizeOrderCharges(newOrder);

    // clear the user's server-side cart
    await Cart.findOneAndUpdate(
      { user: req.userId },
      { items: [], restaurant: null, updatedAt: new Date() },
      { upsert: true }
    );

    await notify({
      userId: req.userId,
      title: "Order placed",
      message: `Your ${newOrder.paymentMethod?.toUpperCase()} order has been placed.`,
      type: "order",
      relatedId: newOrder._id.toString(),
    });

    res.status(201).json({ orderId: newOrder._id, order: newOrder });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message || "order error" });
  }
};

// ---- Reorder ----------------------------------------------------------------

// POST /api/order/reorder/:orderId -> rebuild the cart from a past order
const reorder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.userId,
    }).populate("restaurant");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const restaurant: any = order.restaurant;
    if (!restaurant) {
      return res
        .status(400)
        .json({ message: "This restaurant is no longer available" });
    }

    // rebuild items from the current menu (prices may have changed)
    const items = order.cartItems
      .map((ci: any) => {
        const menuItem = restaurant.menuItems.find(
          (m: any) => m._id.toString() === ci.menuItemId.toString()
        );
        if (!menuItem) return null;
        return {
          menuItemId: ci.menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: ci.quantity,
        };
      })
      .filter(Boolean);

    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        restaurant: restaurant._id,
        items,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({ restaurantId: restaurant._id, cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// ---- Stripe line-item / session builders ------------------------------------

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "gbp",
        unit_amount: menuItem.price,
        product_data: { name: menuItem.name },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return line_item;
  });
  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string,
  discounts?: Stripe.Checkout.SessionCreateParams.Discount[]
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: { amount: deliveryPrice, currency: "gbp" },
        },
      },
    ],
    mode: "payment",
    ...(discounts ? { discounts } : {}),
    metadata: { orderId, restaurantId },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });
  return sessionData;
};

// POST /api/order/:orderId/cancel -> customer cancels an early-stage order
const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.userId,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // only cancellable before the kitchen/rider is committed
    const cancellable = ["placed", "paid", "confirmed"];
    if (!cancellable.includes(order.status)) {
      return res
        .status(400)
        .json({ message: "This order can no longer be cancelled" });
    }

    // refund any wallet balance that was redeemed on the order
    if (order.walletApplied && order.walletApplied > 0 && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { "wallet.balance": order.walletApplied },
        $push: {
          walletTransactions: {
            type: "credit",
            amount: order.walletApplied,
            reason: `Refund for cancelled order ${order._id
              .toString()
              .slice(-6)}`,
          },
        },
      });
    }

    await applyStatusChange(order, "cancelled");
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  createCheckoutSession,
  createCodOrder,
  stripeWebhookHandler,
  getMyOrders,
  getMyOrder,
  reorder,
  cancelOrder,
};
