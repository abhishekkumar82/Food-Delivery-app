import { Request, Response } from "express";
import Cart from "../models/cart";

// GET /api/my/cart  (auth) -> the user's active cart
const getMyCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "restaurant",
      "restaurantName imageUrl deliveryPrice city"
    );
    // return an empty shell rather than 404 so the client can render a cart
    if (!cart) {
      return res.json({ user: req.userId, restaurant: null, items: [] });
    }
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PUT /api/my/cart  (auth) -> replace the whole cart (client is source of truth)
// Body: { restaurantId, items: [{ menuItemId, name, price, quantity, imageUrl, addOns }] }
const updateMyCart = async (req: Request, res: Response) => {
  try {
    const { restaurantId, items } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        restaurant: restaurantId || null,
        items: items || [],
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/my/cart  (auth) -> empty the cart
const clearMyCart = async (req: Request, res: Response) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.userId },
      { items: [], restaurant: null, updatedAt: new Date() },
      { upsert: true }
    );
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
