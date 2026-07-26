import { Request, Response } from "express";
import Driver from "../models/driver";
import Order from "../models/order";
import Restaurant from "../models/restaurant";

// POST /api/driver  (auth) -> register a rider
const createDriver = async (req: Request, res: Response) => {
  try {
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
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { currentLocation: { lat, lng } },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ message: "driver not found" });
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

    await Driver.findByIdAndUpdate(driverId, { isAvailable: false });

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
