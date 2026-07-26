import mongoose from "mongoose";

// Delivery rider. Kept intentionally simple for Tier 1; live-tracking (Tier 2)
// will update `currentLocation` over websockets.
const driverSchema = new mongoose.Schema({
  // optionally linked to an Auth0-backed user account (rider app login)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: "" },
  vehicleType: {
    type: String,
    enum: ["bike", "scooter", "bicycle", "car"],
    default: "bike",
  },
  vehicleNumber: { type: String, default: "" },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
