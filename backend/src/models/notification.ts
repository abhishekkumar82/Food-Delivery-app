import mongoose from "mongoose";

// Tier 2: in-app notifications (order updates, promos, etc.)
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  type: {
    type: String,
    enum: ["order", "promo", "wallet", "system"],
    default: "system",
  },
  // deep-link target, e.g. an order id
  relatedId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
