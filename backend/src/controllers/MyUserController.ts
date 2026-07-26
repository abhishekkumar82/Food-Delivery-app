import {Request ,Response} from "express";
import User from "../models/user";
import { log } from "console";
const getCurrentUser=async(req:Request,res:Response)=>{
    try {
        const currentUser=await User.findOne({_id:req.userId})
        if(!currentUser){
            return res.status(404).json({message:"User not found"});
        }
        res.json(currentUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"something went wrong"})
    }

}
const createCurrentUser=async (req:Request,res:Response)=>{
    try {
        const {auth0Id}=req.body;
        const existingUser=await User.findOne({auth0Id});
        if(existingUser){
            return res.status(200).send();
        }
        const newUser=new User(req.body);
        await newUser.save();
        res.status(201).json(newUser.toObject());
    } catch (error) {
      console.log(error);
      res.status(500).json({message:"Error creating user"});
      
    }
};


const updateCurrentUser=async (req:Request,res:Response)=>{
    try {
        const {name,addressLine1,country,city}=req.body;
        const user=await User.findById(req.userId);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        
        user.name=name;
        user.addressLine1=addressLine1;
        user.city=city;
        user.country=country;

        await user.save();
 console.log(user);
 console.log("hii ia ");
 
 res.send(user);
       

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error updating user "})
        
    }
}

// ---- Tier 1: address book ----

// GET /api/my/user/addresses
const getAddresses = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.addresses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// POST /api/my/user/addresses -> add a new saved address
const addAddress = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // if this is the first address, or flagged default, make it the default
        const makeDefault = req.body.isDefault || user.addresses.length === 0;
        if (makeDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        user.addresses.push({ ...req.body, isDefault: makeDefault });
        await user.save();
        res.status(201).json(user.addresses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// PUT /api/my/user/addresses/:addressId -> edit an address
const updateAddress = async (req: Request, res: Response) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (req.body.isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }
        address.set(req.body);
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// DELETE /api/my/user/addresses/:addressId
const deleteAddress = async (req: Request, res: Response) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        const wasDefault = address.isDefault;
        address.deleteOne();
        // promote the first remaining address to default if needed
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// ---- Tier 2: favorites ----

// GET /api/my/user/favorites -> populated favorite restaurants
const getFavorites = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId).populate("favorites");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.favorites);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// POST /api/my/user/favorites/:restaurantId -> add a favorite
const addFavorite = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $addToSet: { favorites: restaurantId } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.favorites);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// DELETE /api/my/user/favorites/:restaurantId -> remove a favorite
const removeFavorite = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $pull: { favorites: restaurantId } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.favorites);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// ---- Tier 2: wallet & loyalty ----

// GET /api/my/user/wallet -> balance, loyalty points and recent transactions
const getWallet = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId).select(
            "wallet loyaltyPoints walletTransactions"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            balance: user.wallet?.balance ?? 0,
            loyaltyPoints: user.loyaltyPoints ?? 0,
            transactions: (user.walletTransactions ?? [])
                .slice()
                .sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

// POST /api/my/user/wallet/redeem { points } -> convert loyalty points to wallet
// credit (1 point == 1 penny / minor unit).
const redeemLoyalty = async (req: Request, res: Response) => {
    try {
        const points = Math.floor(Number(req.body.points) || 0);
        if (points <= 0) {
            return res.status(400).json({ message: "Enter a valid number of points" });
        }
        const user = await User.findById(req.userId).select("loyaltyPoints");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if ((user.loyaltyPoints ?? 0) < points) {
            return res.status(400).json({ message: "Not enough points" });
        }
        const updated = await User.findByIdAndUpdate(
            req.userId,
            {
                $inc: { loyaltyPoints: -points, "wallet.balance": points },
                $push: {
                    walletTransactions: {
                        type: "credit",
                        amount: points,
                        reason: `Redeemed ${points} loyalty points`,
                    },
                },
            },
            { new: true }
        ).select("wallet loyaltyPoints");
        res.json({
            balance: updated?.wallet?.balance ?? 0,
            loyaltyPoints: updated?.loyaltyPoints ?? 0,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getFavorites,
    addFavorite,
    removeFavorite,
    getWallet,
    redeemLoyalty,
}