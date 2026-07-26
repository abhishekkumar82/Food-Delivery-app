import { FoodType, SpiceLevel } from "@/types";

// Options used by the menu-item editor and dish filters (Tier 1 richer menu).

export const FOOD_TYPES: { label: string; value: FoodType; color: string }[] = [
  { label: "Veg", value: "veg", color: "#16a34a" },
  { label: "Non-Veg", value: "non-veg", color: "#dc2626" },
  { label: "Egg", value: "egg", color: "#d97706" },
  { label: "Vegan", value: "vegan", color: "#059669" },
];

export const SPICE_LEVELS: { label: string; value: SpiceLevel }[] = [
  { label: "None", value: "none" },
  { label: "Mild", value: "mild" },
  { label: "Medium", value: "medium" },
  { label: "Hot", value: "hot" },
  { label: "Extra Hot", value: "extra-hot" },
];

export const MENU_CATEGORIES = [
  "Starters",
  "Main Course",
  "Breads",
  "Rice & Biryani",
  "Desserts",
  "Beverages",
  "Sides",
  "Combos",
  "Others",
];
