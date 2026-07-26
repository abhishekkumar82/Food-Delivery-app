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
});

const User = mongoose.model("User", userSchema);
export default User;
