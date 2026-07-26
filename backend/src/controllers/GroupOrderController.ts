import { Request, Response } from "express";
import GroupOrder from "../models/groupOrder";
import User from "../models/user";
import Cart from "../models/cart";

const makeCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g. "A1B2C3"

const displayName = (user: any) =>
  user?.name || user?.email?.split("@")[0] || "Guest";

// POST /api/group-orders { restaurantId } -> host creates a group
const createGroup = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId required" });
    }
    const user = await User.findById(req.userId);
    const name = displayName(user);

    // ensure a unique code
    let code = makeCode();
    while (await GroupOrder.exists({ code })) code = makeCode();

    const group = await GroupOrder.create({
      code,
      host: req.userId,
      restaurant: restaurantId,
      members: [{ user: req.userId, name }],
      items: [],
      status: "open",
    });
    res.status(201).json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/group-orders/join { code } -> join an existing group
const joinGroup = async (req: Request, res: Response) => {
  try {
    const code = String(req.body.code || "").toUpperCase().trim();
    const group = await GroupOrder.findOne({ code });
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.status === "placed") {
      return res.status(409).json({ message: "This group order is already placed" });
    }

    const already = group.members.some(
      (m) => m.user?.toString() === req.userId
    );
    if (!already) {
      const user = await User.findById(req.userId);
      group.members.push({ user: req.userId as any, name: displayName(user) });
      await group.save();
    }
    res.json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/group-orders/:code -> current group state
const getGroup = async (req: Request, res: Response) => {
  try {
    const group = await GroupOrder.findOne({
      code: req.params.code.toUpperCase(),
    }).populate("restaurant", "restaurantName city imageUrl");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/group-orders/:code/items -> add an item to the shared cart
const addItem = async (req: Request, res: Response) => {
  try {
    const group = await GroupOrder.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.status !== "open") {
      return res.status(409).json({ message: "This group is no longer open" });
    }
    const user = await User.findById(req.userId);
    const { menuItemId, name, price, quantity } = req.body;
    group.items.push({
      menuItemId,
      name,
      price,
      quantity: quantity || 1,
      addedBy: req.userId as any,
      addedByName: displayName(user),
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// DELETE /api/group-orders/:code/items/:itemId -> remove an item (own item or host)
const removeItem = async (req: Request, res: Response) => {
  try {
    const group = await GroupOrder.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const item = group.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isHost = group.host.toString() === req.userId;
    const isOwner = item.addedBy?.toString() === req.userId;
    if (!isHost && !isOwner) {
      return res.status(403).json({ message: "You can only remove your own items" });
    }
    item.deleteOne();
    await group.save();
    res.json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// POST /api/group-orders/:code/checkout -> host loads shared items into their
// cart and the group is marked placed; frontend redirects to normal checkout.
const checkoutGroup = async (req: Request, res: Response) => {
  try {
    const group = await GroupOrder.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.host.toString() !== req.userId) {
      return res.status(403).json({ message: "Only the host can place the order" });
    }
    if (group.items.length === 0) {
      return res.status(400).json({ message: "The group cart is empty" });
    }

    const items = group.items.map((i) => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    await Cart.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        restaurant: group.restaurant,
        items,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    group.status = "placed";
    await group.save();

    res.json({ restaurantId: group.restaurant });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  createGroup,
  joinGroup,
  getGroup,
  addItem,
  removeItem,
  checkoutGroup,
};
