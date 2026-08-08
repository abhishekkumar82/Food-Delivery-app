import { Request, Response } from "express";
import Driver from "../models/driver";
import Order from "../models/order";
import Restaurant from "../models/restaurant";
import { emitDriverLocation } from "../lib/orderEffects";
import { notify } from "../lib/notify";

// POST /api/driver  (auth, restaurant owner) -> register a rider
const createDriver = async (req: Request, res: Response) => {
  try {
    // only restaurant owners manage delivery riders, so gate registration to them
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res
        .status(403)
        .json({ message: "Only restaurant owners can register riders" });
    }
    const driver = new Driver({ ...req.body, user: req.userId });
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// GET /api/driver/available  (auth) -> riders free to take an order
const getAvailableDrivers = async (_req: Request, res: Response) => {
  try {
    const drivers = await Driver.find({ isAvailable: true });
    res.json(drivers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PATCH /api/driver/:driverId/location  (auth) -> update rider position
const updateLocation = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { lat, lng } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "driver not found" });
    }
    // a rider's position may only be updated by the account that owns it
    if (driver.user?.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own rider location" });
    }
    driver.currentLocation = { lat, lng } as any;
    await driver.save();

    // broadcast this rider's position to everyone tracking their active orders
    const activeOrders = await Order.find({
      driver: driverId,
      status: { $in: ["readyForPickup", "outForDelivery"] },
    }).select("_id");
    for (const o of activeOrders) {
      o.set("driverLocation", { lat, lng, updatedAt: new Date() });
      await o.save();
      emitDriverLocation(o._id.toString(), lat, lng);
    }

    res.json(driver);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// PATCH /api/driver/assign/:orderId  (auth, restaurant owner) -> assign a rider
const assignDriverToOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    // only the restaurant owner may assign a rider to this order
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant?.user?.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.driver = driverId;
    await order.save();

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { isAvailable: false },
      { new: true }
    );

    // let the customer know a rider is on the way
    if (order.user && driver) {
      await notify({
        userId: order.user.toString(),
        title: "A rider has been assigned",
        message: `${driver.name} (${driver.vehicleType}) will deliver your order.`,
        type: "order",
        relatedId: order._id.toString(),
      });
    }

    const populated = await order.populate("driver");
    res.json(populated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default {
  createDriver,
  getAvailableDrivers,
  updateLocation,
  assignDriverToOrder,
};
