/**
 * Generates a large, realistic demo dataset — many owners, ~200 restaurants,
 * each with a full menu (with dish images) and rating aggregates.
 *
 * Run with:  npm run seed:bulk
 * Re-runnable: it clears its own previously-generated data first (owners whose
 * auth0Id starts with "seed|bulk-owner-"), so real data is never touched.
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user";
import Restaurant from "../models/restaurant";

const TOTAL = 200;
const OWNERS = 30;

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

const CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Bristol",
  "Liverpool",
];

// cuisine -> banner image + dish pool ([name, basePrice in pence])
const CUISINES: Record<
  string,
  { banner: string; dishes: [string, number][] }
> = {
  Italian: {
    banner: "photo-1513104890138-7c749659a591",
    dishes: [
      ["Margherita Pizza", 899], ["Pepperoni Pizza", 1049], ["Spaghetti Carbonara", 999],
      ["Lasagne", 1149], ["Penne Arrabbiata", 949], ["Garlic Bread", 399],
      ["Tiramisu", 499], ["Bruschetta", 549],
    ],
  },
  Indian: {
    banner: "photo-1585937421612-70a008356fbe",
    dishes: [
      ["Butter Chicken", 1099], ["Paneer Tikka", 949], ["Chicken Biryani", 1049],
      ["Veg Biryani", 899], ["Garlic Naan", 299], ["Dal Makhani", 849],
      ["Gulab Jamun", 399], ["Samosa (2pc)", 349],
    ],
  },
  Chinese: {
    banner: "photo-1585032226651-759b368d7246",
    dishes: [
      ["Kung Pao Chicken", 999], ["Sweet & Sour Pork", 1049], ["Veg Spring Rolls", 449],
      ["Egg Fried Rice", 699], ["Chow Mein", 849], ["Szechuan Tofu", 899],
      ["Wonton Soup", 549], ["Prawn Toast", 649],
    ],
  },
  Japanese: {
    banner: "photo-1579584425555-c3ce17fd4351",
    dishes: [
      ["Salmon Nigiri (6pc)", 750], ["California Roll", 699], ["Chicken Katsu Curry", 1199],
      ["Miso Soup", 299], ["Edamame", 349], ["Ramen Bowl", 1099],
      ["Gyoza (5pc)", 599], ["Teriyaki Chicken", 1049],
    ],
  },
  American: {
    banner: "photo-1568901346375-23c9450c58cd",
    dishes: [
      ["Classic Cheeseburger", 999], ["Bacon Double Burger", 1249], ["BBQ Ribs", 1399],
      ["Buffalo Wings", 849], ["Loaded Fries", 599], ["Mac & Cheese", 699],
      ["Caesar Salad", 749], ["Brownie Sundae", 549],
    ],
  },
  Mexican: {
    banner: "photo-1565299624946-b28f40a0ae38",
    dishes: [
      ["Chicken Tacos (3pc)", 849], ["Beef Burrito", 999], ["Loaded Nachos", 699],
      ["Quesadilla", 799], ["Guacamole & Chips", 549], ["Chilli Con Carne", 949],
      ["Churros", 449], ["Veggie Fajitas", 899],
    ],
  },
};

const CUISINE_NAMES = Object.keys(CUISINES);

const DISH_IMAGES = [
  "photo-1568901346375-23c9450c58cd", "photo-1513104890138-7c749659a591",
  "photo-1546069901-ba9599a7e63c", "photo-1551183053-bf91a1d81141",
  "photo-1567620905732-2d1ec7ab7445", "photo-1565299624946-b28f40a0ae38",
  "photo-1504674900247-0877df9cc836", "photo-1476224203421-9ac39bcb3327",
];

const ADJ = ["Golden", "Royal", "Urban", "Rustic", "Spicy", "Green", "Blue", "Little", "Grand", "Cosy", "Corner", "Twin"];
const NOUN = ["Spoon", "Kitchen", "Table", "Bites", "Grill", "Garden", "House", "Bistro", "Feast", "Pantry", "Diner", "Plate"];
const FOOD_TYPES = ["veg", "non-veg", "egg", "vegan"] as const;
const SPICE = ["none", "mild", "medium", "hot"] as const;
const CATEGORIES = ["Starters", "Main Course", "Sides", "Desserts"];

const rand = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function run() {
  const conn = process.env.MONGODB_CONECTION_STRING;
  if (!conn) throw new Error("MONGODB_CONECTION_STRING is not set");
  await mongoose.connect(conn);
  console.log("connected to mongodb");

  // wipe previously-generated bulk data (never touches real users/restaurants)
  const oldOwners = await User.find({
    auth0Id: { $regex: /^seed\|bulk-owner-/ },
  }).select("_id");
  const oldOwnerIds = oldOwners.map((o) => o._id);
  await Restaurant.deleteMany({ user: { $in: oldOwnerIds } });

  // owners
  const ownerIds: mongoose.Types.ObjectId[] = [];
  for (let i = 1; i <= OWNERS; i++) {
    const owner = await User.findOneAndUpdate(
      { auth0Id: `seed|bulk-owner-${i}` },
      {
        $set: { role: "owner" },
        $setOnInsert: {
          auth0Id: `seed|bulk-owner-${i}`,
          email: `bulkowner${i}@seed.local`,
          name: `Owner ${i}`,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    ownerIds.push(owner!._id as mongoose.Types.ObjectId);
  }

  const usedNames = new Set<string>();
  const restaurantName = () => {
    let name = "";
    do {
      const prefix = Math.random() < 0.5 ? "The " : "";
      name = `${prefix}${rand(ADJ)} ${rand(NOUN)}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  };

  const docs = [];
  for (let i = 0; i < TOTAL; i++) {
    const primary = rand(CUISINE_NAMES);
    const secondary = rand(CUISINE_NAMES);
    const cuisines = Array.from(new Set([primary, secondary]));

    // build a menu by mixing dishes from the restaurant's cuisines
    const pool = cuisines.flatMap((c) => CUISINES[c].dishes);
    const count = randInt(5, 8);
    const chosen = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    const menuItems = chosen.map(([name, base]) => ({
      name,
      price: base + randInt(-50, 150),
      description: `Freshly prepared ${name.toLowerCase()}.`,
      category: rand(CATEGORIES),
      foodType: rand(FOOD_TYPES),
      spiceLevel: rand(SPICE),
      isBestseller: Math.random() < 0.2,
      inStock: Math.random() < 0.95,
      imageUrl: img(rand(DISH_IMAGES)),
    }));

    docs.push({
      user: ownerIds[i % OWNERS],
      restaurantName: restaurantName(),
      city: rand(CITIES),
      country: "United Kingdom",
      deliveryPrice: randInt(0, 4) * 50 + 99, // 99..299 pence
      estimatedDeliveryTime: randInt(20, 50),
      cuisines,
      imageUrl: img(CUISINES[primary].banner),
      menuItems,
      averageRating: +(Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 .. 5.0
      reviewCount: randInt(5, 320),
      lastUpdated: new Date(),
      isOpenOverride: "auto",
    });
  }

  await Restaurant.insertMany(docs);
  console.log(
    `✅ generated ${docs.length} restaurants across ${OWNERS} owners in ${CITIES.length} cities`
  );

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("generation failed:", e);
  process.exit(1);
});
