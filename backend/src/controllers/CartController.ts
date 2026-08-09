import { Request, Response } from "express";
import Cart from "../models/cart";

// GET /api/my/cart?restaurantId=...  (auth)
// With restaurantId -> that restaurant's basket ({ restaurant, items }).
// Without -> all baskets ({ carts: [...] }).
const getMyCart = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurantId as string | undefined;
    const cart = await Cart.findOne({ user: req.userId });

    if (restaurantId) {
      const sub = cart?.carts.find(
        (c: any) => c.restaurant.toString() === restaurantId
      );
      return res.json({
        user: req.userId,
        restaurant: restaurantId,
        items: sub?.items ?? [],
      });
    }

    return res.json({ user: req.userId, carts: cart?.carts ?? [] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PUT /api/my/cart  (auth) -> replace ONE restaurant's basket (client is source of truth).
// Body: { restaurantId, items: [...] }. Empty items removes that restaurant's basket.
const updateMyCart = async (req: Request, res: Response) => {
  try {
    const { restaurantId, items } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    const cart =
      (await Cart.findOne({ user: req.userId })) ??
      new Cart({ user: req.userId, carts: [] });

    const idx = cart.carts.findIndex(
      (c: any) => c.restaurant.toString() === restaurantId
    );

    if (!items || items.length === 0) {
      // emptying a basket removes it, so it doesn't linger on other pages
      if (idx >= 0) cart.carts.splice(idx, 1);
    } else if (idx >= 0) {
      cart.carts[idx].items = items;
      cart.carts[idx].updatedAt = new Date();
    } else {
      cart.carts.push({ restaurant: restaurantId, items, updatedAt: new Date() });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({
      user: req.userId,
      restaurant: restaurantId,
      items: items ?? [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/my/cart  (auth) -> clear one restaurant's basket (body.restaurantId) or all.
const clearMyCart = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.body?.restaurantId as string | undefined;
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(200).json({ message: "cart cleared" });

    if (restaurantId) {
      cart.carts = cart.carts.filter(
        (c: any) => c.restaurant.toString() !== restaurantId
      ) as any;
    } else {
      cart.carts = [] as any;
    }
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "cart cleared" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  getMyCart,
  updateMyCart,
  clearMyCart,
};
