import mongoose from "mongoose";

// ---- Tier 3: surplus "surprise bags" (Too Good To Go style) ----
const surpriseBagSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  originalPrice: { type: Number, required: true }, // minor units
  price: { type: Number, required: true }, // discounted price, minor units
  quantity: { type: Number, required: true, default: 1 }, // remaining stock
  pickupStart: { type: String, default: "18:00" }, // HH:mm
  pickupEnd: { type: String, default: "21:00" },
  foodType: {
    type: String,
    enum: ["veg", "non-veg", "mixed"],
    default: "mixed",
  },
  isActive: { type: Boolean, default: true },
  claims: {
    type: [
      new mongoose.Schema(
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          claimedAt: { type: Date, default: Date.now },
        },
        { _id: true }
      ),
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

const SurpriseBag = mongoose.model("SurpriseBag", surpriseBagSchema);
export default SurpriseBag;
