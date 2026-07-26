export type Address = {
  _id: string;
  label: "Home" | "Work" | "Other";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  pincode?: string;
  phone?: string;
  location?: { lat?: number; lng?: number };
  isDefault: boolean;
};

export type User = {
  _id: string;
  email: string;
  name: string;
  addressLine1: string;
  city: string;
  country: string;
  addresses?: Address[];
};

export type AddOn = {
  _id?: string;
  name: string;
  price: number;
};

export type FoodType = "veg" | "non-veg" | "egg" | "vegan";
export type SpiceLevel = "none" | "mild" | "medium" | "hot" | "extra-hot";

export type menuItem = {
  _id: string;
  name: string;
  price: number;
  // ---- Tier 1: richer menu items ----
  description?: string;
  imageUrl?: string;
  category?: string;
  foodType?: FoodType;
  spiceLevel?: SpiceLevel;
  inStock?: boolean;
  isBestseller?: boolean;
  addOns?: AddOn[];
  averageRating?: number;
  reviewCount?: number;
};

export type OpeningHour = {
  day: number; // 0 = Sunday ... 6 = Saturday
  open: string;
  close: string;
  isClosed: boolean;
};

export type Restaurant = {
  _id: string;
  user: string;
  restaurantName: string;
  city: string;
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItems: menuItem[];
  imageUrl: string;
  LastUpdated: string;
  // ---- Tier 1 ----
  averageRating?: number;
  reviewCount?: number;
  location?: { lat?: number; lng?: number };
  openingHours?: OpeningHour[];
  isOpenOverride?: "auto" | "open" | "closed";
};

export type Review = {
  _id: string;
  restaurant: string;
  user: { _id: string; name: string } | string;
  order?: string;
  menuItemId?: string | null;
  rating: number;
  comment: string;
  imageUrls?: string[];
  createdAt: string;
};

export type Driver = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: "bike" | "scooter" | "bicycle" | "car";
  vehicleNumber?: string;
  isAvailable: boolean;
  currentLocation?: { lat?: number; lng?: number };
  averageRating?: number;
};

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  addOns?: AddOn[];
};

export type Cart = {
  _id?: string;
  user: string;
  restaurant: Restaurant | string | null;
  items: CartItem[];
  updatedAt?: string;
};

export type OrderStatus =
  | "placed"
  | "paid"
  | "confirmed"
  | "inProgress"
  | "readyForPickup"
  | "outForDelivery"
  | "delivered"
  | "cancelled";

export type Order = {
  _id: string;
  restaurant: Restaurant;
  user: User;
  driver?: Driver;
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
    addOns?: AddOn[];
  }[];
  deliveryDetails: {
    name: string;
    addressLine1: string;
    city: string;
    email: string;
    location?: { lat?: number; lng?: number };
  };
  totalAmount: number;
  status: OrderStatus;
  isReviewed?: boolean;
  createdAt: string;
  restaurantId: string;
};

export type RestaurantSearchResponse = {
  data: Restaurant[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};
