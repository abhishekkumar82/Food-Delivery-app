import mongoose, { InferSchemaType } from "mongoose";

// Add-on / customization option for a menu item (e.g. "Extra cheese" +50)
const addOnSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const menuItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // ---- Tier 1: richer menu items ----
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  category: { type: String, default: "Others" }, // Starters, Main Course, Desserts...
  foodType: {
    type: String,
    enum: ["veg", "non-veg", "egg", "vegan"],
    default: "veg",
  },
  spiceLevel: {
    type: String,
    enum: ["none", "mild", "medium", "hot", "extra-hot"],
    default: "none",
  },
  inStock: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  addOns: { type: [addOnSchema], default: [] },
  // per-dish rating aggregates (updated when a dish review is submitted)
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

// Opening hours per weekday (0 = Sunday ... 6 = Saturday)
const openingHourSchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 0, max: 6 },
  open: { type: String, default: "09:00" }, // "HH:mm"
  close: { type: String, default: "22:00" },
  isClosed: { type: Boolean, default: false },
});

const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
  // ---- Tier 1: ratings powering search + trust ----
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // ---- Tier 1: geolocation for distance-based delivery ----
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  // ---- Tier 1: open/close hours ----
  openingHours: { type: [openingHourSchema], default: [] },
  isOpenOverride: {
    // let owners force-close ("busy") regardless of schedule
    type: String,
    enum: ["auto", "open", "closed"],
    default: "auto",
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
