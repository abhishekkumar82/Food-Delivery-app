import mongoose from "mongoose";

// ---- Tier 3: group ordering (shared cart via invite code) ----
const groupItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // minor units
    quantity: { type: Number, required: true, default: 1 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedByName: { type: String, default: "" },
  },
  { _id: true }
);

const groupOrderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  members: {
    type: [
      new mongoose.Schema(
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          name: { type: String, default: "" },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  items: { type: [groupItemSchema], default: [] },
  status: {
    type: String,
    enum: ["open", "locked", "placed"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
});

const GroupOrder = mongoose.model("GroupOrder", groupOrderSchema);
export default GroupOrder;
