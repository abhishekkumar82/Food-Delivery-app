import mongoose from "mongoose";

// A single saved delivery address (Tier 1: address book)
const addressSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  label: {
    type: String,
    enum: ["Home", "Work", "Other"],
    default: "Home",
  },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: "" },
  city: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // ---- Role-based access control ----
  role: {
    type: String,
    enum: ["customer", "owner", "admin"],
    default: "customer",
  },
  name: {
    type: String,
  },
  // kept for backward-compatibility with the existing profile form
  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  // ---- Tier 1: multiple saved addresses ----
  addresses: { type: [addressSchema], default: [] },
  // ---- Tier 2: favorites, wallet & loyalty ----
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  wallet: {
    balance: { type: Number, default: 0 }, // stored in minor units (pence/paise)
  },
  loyaltyPoints: { type: Number, default: 0 },
  // ---- Tier 3: membership / subscription ----
  membership: {
    plan: {
      type: String,
      enum: ["none", "gold", "pro"],
      default: "none",
    },
    active: { type: Boolean, default: false },
    startedAt: { type: Date },
    expiresAt: { type: Date },
  },
  walletTransactions: {
    type: [
      new mongoose.Schema(
        {
          type: { type: String, enum: ["credit", "debit"], required: true },
          amount: { type: Number, required: true },
          reason: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
        { _id: true }
      ),
    ],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
