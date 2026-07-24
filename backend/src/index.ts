// import express,{Request,Response} from "express";
// var cors = require('cors');
// import "dotenv/config";
// import bodyParser from 'body-parser';
// require('dotenv').config();
// import mongoose from "mongoose";
// import { log } from "console";
// import {v2 as cloudinary} from "cloudinary"
// import myRestaurantRoute from "./route/MyRoute"
// import myUserRoute from "./route/MyUserRoute"
// import restaurantRoute from "./route/RestaurantRoute";
// import OrderController from "./controllers/OrderController";
// import orderRoute from "./route/OrderRoute"
// async function connectToMongoDB(connectionString:string) {
//     await mongoose.connect(connectionString);
//     console.log('connected to mongodb database');  
// }
// // try{
// //      await connectToMongoDB(process.env.MONGODB_CONECTION_STRING as string);
// // } catch(e){
// //     console.log('Error connecting to MongoDB',e);
    
// // }
// async function main() {
//     try {
//         await connectToMongoDB(process.env.MONGODB_CONECTION_STRING as string);
//     } catch (e) {
//         console.log('Error connecting to MongoDB', e);
//     }
// }
// main();
// cloudinary.config({
//     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret:process.env.CLOUDINARY_API_SECRET,
// })
// const app=express();

// app.use(cors());


// // app.use("/api/order/checkout/webhook",express.raw({type:"*/*"}));
// app.post('/api/order/checkout/webhook', bodyParser.raw({ type: 'application/json' }));

// app.use(express.json());
// app.get("/health",async(req:Request,res:Response)=>{
//     res.send({message:"Health Ok!"});
// })

// app.use("/api/my/user",myUserRoute);
// app.use("/api/my/restaurant", myRestaurantRoute);
// app.use("/api/restaurant",restaurantRoute)
// app.use("/api/order",orderRoute);


// app.get("/test", async (req:Request, res:Response )=> {
//       res.json({message:"Hello"});
// })

// app.listen(7000,()=>{
//     console.log("server started on localhost :7000");
    
// })



import express, { Request, Response } from "express";
import cors from 'cors';
import "dotenv/config";
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./route/MyResturantRoute";
import myUserRoute from "./route/MyUserRoute";
import restaurantRoute from "./route/RestaurantRoute";
import OrderController from "./controllers/OrderController";
import orderRoute from "./route/OrderRoute";
import stripeWebhookHandler from './controllers/OrderController';

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

app.use(cors());

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

app.post('/api/order/checkout/webhook', OrderController.stripeWebhookHandler);

app.get("/test", async (req: Request, res: Response) => {
    res.json({ message: "Hello" });
});

app.listen(7000, () => {
    console.log("server started on localhost:7000");
});
