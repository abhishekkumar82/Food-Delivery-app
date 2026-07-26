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
  // ---- Tier 2 ----
  paymentMethod?: "card" | "cod" | "upi" | "wallet";
  coupon?: { code?: string; discountAmount?: number };
  walletApplied?: number;
  scheduledFor?: string;
  loyaltyEarned?: number;
  driverLocation?: { lat?: number; lng?: number; updatedAt?: string };
  statusHistory?: { status: OrderStatus; at: string }[];
};

// ---- Tier 2 ----
export type Coupon = {
  _id?: string;
  code: string;
  description?: string;
  discountType: "percent" | "flat";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
};

export type AppliedCoupon = {
  code: string;
  description?: string;
  discountType: "percent" | "flat";
  value: number;
  discountAmount: number;
};

export type WalletTransaction = {
  _id?: string;
  type: "credit" | "debit";
  amount: number;
  reason?: string;
  createdAt: string;
};

export type WalletInfo = {
  balance: number;
  loyaltyPoints: number;
  transactions: WalletTransaction[];
};

export type AppNotification = {
  _id: string;
  title: string;
  message?: string;
  type: "order" | "promo" | "wallet" | "system";
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
};

// ---- Tier 3 ----
export type MembershipPlan = {
  id: "gold" | "pro";
  name: string;
  price: number;
  durationDays: number;
  discountPercent: number;
  freeDelivery: boolean;
  perks: string[];
};

export type Membership = {
  plan: "none" | "gold" | "pro";
  active: boolean;
  startedAt?: string;
  expiresAt?: string;
};

export type MembershipResponse = {
  membership: Membership;
  walletBalance: number;
  plans: MembershipPlan[];
};

export type Sustainability = {
  totalOrders: number;
  ecoOrders: number;
  mealsRescued: number;
  totalCarbonKg: number;
  carbonSavedKg: number;
  treesEquivalent: number;
  kmNotDriven: number;
};

export type SurpriseBag = {
  _id: string;
  restaurant:
    | string
    | { _id: string; restaurantName: string; city: string; imageUrl?: string };
  title: string;
  description: string;
  originalPrice: number;
  price: number;
  quantity: number;
  pickupStart: string;
  pickupEnd: string;
  foodType: "veg" | "non-veg" | "mixed";
  isActive: boolean;
  createdAt: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  goal: number;
};

export type Gamification = {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  stats: {
    totalOrders: number;
    totalReviews: number;
    distinctRestaurants: number;
    currentStreak: number;
    longestStreak: number;
    totalSpent: number;
  };
  badges: Badge[];
  earnedCount: number;
};

export type RestaurantAnalytics = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  statusBreakdown: Record<string, number>;
  topItems: { name: string; quantity: number }[];
  last7Days: { date: string; revenue: number; orders: number }[];
};

export type RestaurantSearchResponse = {
  data: Restaurant[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};
