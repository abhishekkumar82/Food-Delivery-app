import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./route/MyResturantRoute";
import myUserRoute from "./route/MyUserRoute";
import restaurantRoute from "./route/RestaurantRoute";
import OrderController from "./controllers/OrderController";
import orderRoute from "./route/OrderRoute";
import cartRoute from "./route/CartRoute";
import driverRoute from "./route/DriverRoute";
import couponRoute from "./route/CouponRoute";
import notificationRoute from "./route/NotificationRoute";
import membershipRoute from "./route/MembershipRoute";
import gamificationRoute from "./route/GamificationRoute";
import surpriseBagRoute from "./route/SurpriseBagRoute";
import sustainabilityRoute from "./route/SustainabilityRoute";
import groupOrderRoute from "./route/GroupOrderRoute";
import aiRoute from "./route/AiRoute";
import adminRoute from "./route/AdminRoute";
import { setIO } from "./lib/socket";

async function connectToMongoDB(connectionString: string) {
    await mongoose.connect(connectionString);
    console.log('connected to mongodb database');  
}

async function main() {
    try {
        await connectToMongoDB(process.env.MONGODB_CONECTION_STRING as string);
    } catch (e) {
        console.log('Error connecting to MongoDB', e);
    }
}

main();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// only allow the configured frontend origin (falls back to the Vite dev server)
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));

// security response headers
app.use(helmet());

// basic API rate limiting (generous — polling clients make frequent requests)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Apply raw body parser specifically for Stripe webhook endpoint
app.use('/api/order/checkout/webhook', bodyParser.raw({ type: 'application/json' }));

// Other middlewares
app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "Health Ok!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/order", orderRoute);
app.use("/api/my/cart", cartRoute);
app.use("/api/driver", driverRoute);
// ---- Tier 2 ----
app.use("/api/coupon", couponRoute);
app.use("/api/my/notifications", notificationRoute);
// ---- Tier 3 ----
app.use("/api/my/membership", membershipRoute);
app.use("/api/my/gamification", gamificationRoute);
app.use("/api/surprise-bags", surpriseBagRoute);
app.use("/api/my/sustainability", sustainabilityRoute);
app.use("/api/group-orders", groupOrderRoute);
app.use("/api/ai", aiRoute);
app.use("/api/admin", adminRoute);

app.post('/api/order/checkout/webhook', OrderController.stripeWebhookHandler);

app.get("/test", async (req: Request, res: Response) => {
    res.json({ message: "Hello" });
});

// unknown API routes return JSON instead of an HTML error page
app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
});

// centralized error handler — must be the last middleware (4 args)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(err?.status || 500).json({ message: "Internal server error" });
});

// ---- Tier 2: Socket.io real-time layer (live order tracking + notifications) ----
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: allowedOrigin },
});
setIO(io);

io.on("connection", (socket) => {
    // client joins a room per user (for notifications) and per order (for tracking)
    socket.on("joinUser", (userId: string) => {
        if (userId) socket.join(`user:${userId}`);
    });
    socket.on("joinOrder", (orderId: string) => {
        if (orderId) socket.join(`order:${orderId}`);
    });
    socket.on("leaveOrder", (orderId: string) => {
        if (orderId) socket.leave(`order:${orderId}`);
    });
});

server.listen(7000, () => {
    console.log("server started on localhost:7000");
});
