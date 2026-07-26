import mongoose from "mongoose";

// Persistent cart saved server-side so it survives refresh/device switch,
// and powers re-order / abandoned-cart nudges later.
const cartItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  imageUrl: { type: String, default: "" },
  addOns: [
    {
      name: { type: String },
      price: { type: Number },
    },
  ],
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one active cart per user
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  items: { type: [cartItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
