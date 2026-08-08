import { Request,Response } from "express";
import Restaurant from "../models/restaurant";
import User from "../models/user";
import cloudinary from "cloudinary"
import mongoose from "mongoose";
import Order from "../models/order";
import { applyStatusChange } from "../lib/orderEffects";

const getMyRestaurant=async(req:Request,res:Response)=>{
    try {
       const restaurant=await Restaurant.findOne({user:req.userId});
       if(!restaurant){
        return res.status(404).json({message:"restaurant not found"})
       }
       res.json(restaurant);
    } catch (error) {
      console.log("error ",error);
      res.status(500).json({message:"Error fetching restaurant"});
    }
}


const createMyRestaurant = async (req: Request, res: Response) => {
    try {
      const existingRestaurant = await Restaurant.findOne({ user: req.userId });

      if (existingRestaurant) {
        return res
          .status(409)
          .json({ message: "User restaurant already exists" });
      }

      // require the registration fee to be paid first (admins are exempt)
      const feeRequired = Number(process.env.PARTNER_REGISTRATION_FEE) || 0;
      if (feeRequired > 0) {
        const account = await User.findById(req.userId).select(
          "role partnerFeePaid"
        );
        if (account?.role !== "admin" && !account?.partnerFeePaid) {
          return res.status(402).json({
            message: "Please pay the partner registration fee first",
          });
        }
      }

      const imageUrl = await uploadImage(req.file as Express.Multer.File);
  
      const restaurant = new Restaurant(req.body);
      restaurant.imageUrl = imageUrl;
      restaurant.user = new mongoose.Types.ObjectId(req.userId);
      restaurant.lastUpdated = new Date();
      await restaurant.save();

      // becoming a partner promotes the account to the "owner" role
      // (don't downgrade an admin who also runs a restaurant)
      await User.updateOne(
        { _id: req.userId, role: "customer" },
        { role: "owner" }
      );

      res.status(201).send(restaurant);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };

  const updateMyRestaurant=async(req:Request,res:Response)=>{
    try {
       const restaurant=await Restaurant.findOne({
        user:req.userId,
       })
       if(!restaurant){
        return res.status(404).json({message:'restaurant not found'});
       }
      restaurant.restaurantName=req.body.restaurantName;
      restaurant.city=req.body.city;
      restaurant.country=req.body.country;
      restaurant.deliveryPrice=req.body.deliveryPrice;
      restaurant.estimatedDeliveryTime=req.body.estimatedDeliveryTime;
      restaurant.cuisines=req.body.cuisines;
      restaurant.menuItems=req.body.menuItems;
      restaurant.lastUpdated=new Date();

      if(req.file){
        const imageUrl = await uploadImage(req.file as Express.Multer.File);
        restaurant.imageUrl=imageUrl;
      }
      await restaurant.save();
      res.status(200).send(restaurant);
    } catch (error) {
      console.log("error",error);
      res.status(500).json({message:"Something went wrong"});
    }
  }
  


  const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
      const restaurant = await Restaurant.findOne({ user: req.userId });
      if (!restaurant) {
        return res.status(404).json({ message: "restaurant not found" });
      }
  
      const orders = await Order.find({ restaurant: restaurant._id })
        .populate("restaurant")
        .populate("user");
  
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  };

const updateOrderStatus=async(req:Request,res:Response)=>{
  try {
    const {orderId}=req.params;
    const {status} =req.body;
    const order=await Order.findById(orderId);
    if(!order){
      return res.status(400).json({message:"order not found"});
    }
    const restaurant=await Restaurant.findById(order.restaurant);
    if(restaurant?.user?._id.toString()!==req.userId){
      return res.status(401).send();
    }
    // records history, awards loyalty on delivery, emits socket + notification
    await applyStatusChange(order, status);
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"something went wrong"});
  }
}

// ---- Tier 3: restaurant analytics dashboard ----
// GET /api/my/restaurant/analytics -> revenue, orders, top items, trends
const getRestaurantAnalytics = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    const orders = await Order.find({ restaurant: restaurant._id });

    // orders that represent real revenue (paid or fulfilled, not cancelled)
    const revenueOrders = orders.filter(
      (o) => o.status !== "placed" && o.status !== "cancelled"
    );

    const totalRevenue = revenueOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );
    const totalOrders = orders.length;
    const avgOrderValue =
      revenueOrders.length > 0
        ? Math.round(totalRevenue / revenueOrders.length)
        : 0;

    // status breakdown
    const statusBreakdown: Record<string, number> = {};
    orders.forEach((o) => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    });

    // top menu items by quantity ordered
    const itemMap: Record<string, { name: string; quantity: number }> = {};
    orders.forEach((o) => {
      o.cartItems.forEach((ci: any) => {
        const key = ci.name;
        if (!itemMap[key]) itemMap[key] = { name: ci.name, quantity: 0 };
        itemMap[key].quantity += ci.quantity || 0;
      });
    });
    const topItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // revenue for the last 7 days (daily buckets)
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);

      const dayOrders = revenueOrders.filter((o) => {
        const created = new Date(o.createdAt as any);
        return created >= day && created < next;
      });
      days.push({
        date: day.toISOString().slice(0, 10),
        revenue: dayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        orders: dayOrders.length,
      });
    }

    res.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      statusBreakdown,
      topItems,
      last7Days: days,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
  };
  export default{
    updateOrderStatus,
    getMyRestaurantOrders,
    createMyRestaurant,
    getMyRestaurant,
    updateMyRestaurant,
    getRestaurantAnalytics,
}
