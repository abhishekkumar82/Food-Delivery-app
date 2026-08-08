/**
 * Dev seed script — populates a few realistic restaurants (with rich menus,
 * images and Tier-1 fields) plus sample reviews so the app demos well.
 *
 * Run with:  npm run seed
 * Idempotent: re-running updates the same records (matched by name / auth0Id).
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user";
import Restaurant from "../models/restaurant";
import Review from "../models/review";

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

const restaurants = [
  {
    ownerAuth0Id: "seed|owner-bella",
    ownerEmail: "owner.bella@seed.local",
    restaurantName: "Bella Napoli",
    city: "London",
    country: "United Kingdom",
    deliveryPrice: 199,
    estimatedDeliveryTime: 30,
    cuisines: ["Italian", "Pizza", "Pasta"],
    imageUrl: img("photo-1513104890138-7c749659a591"),
    ratings: [5, 4, 5, 4],
    menuItems: [
      { name: "Margherita Pizza", price: 899, description: "Wood-fired with fresh mozzarella & basil", category: "Main Course", foodType: "veg", spiceLevel: "none", isBestseller: true },
      { name: "Pepperoni Pizza", price: 1049, description: "Loaded with spicy pepperoni", category: "Main Course", foodType: "non-veg", spiceLevel: "medium" },
      { name: "Spaghetti Carbonara", price: 999, description: "Creamy egg, pancetta & parmesan", category: "Main Course", foodType: "non-veg", spiceLevel: "none", isBestseller: true },
      { name: "Garlic Bread", price: 399, description: "Toasted ciabatta with garlic butter", category: "Starters", foodType: "veg", spiceLevel: "none" },
      { name: "Tiramisu", price: 499, description: "Classic coffee-soaked dessert", category: "Desserts", foodType: "veg", spiceLevel: "none" },
    ],
  },
  {
    ownerAuth0Id: "seed|owner-sakura",
    ownerEmail: "owner.sakura@seed.local",
    restaurantName: "Sakura Sushi House",
    city: "London",
    country: "United Kingdom",
    deliveryPrice: 249,
    estimatedDeliveryTime: 35,
    cuisines: ["Japanese", "Sushi", "Asian"],
    imageUrl: img("photo-1579584425555-c3ce17fd4351"),
    ratings: [4, 5, 4, 5],
    menuItems: [
      { name: "Salmon Nigiri (6pc)", price: 750, description: "Fresh salmon over seasoned rice", category: "Main Course", foodType: "non-veg", spiceLevel: "none", isBestseller: true },
      { name: "California Roll", price: 699, description: "Crab, avocado & cucumber", category: "Main Course", foodType: "non-veg", spiceLevel: "none" },
      { name: "Chicken Katsu Curry", price: 1199, description: "Crispy chicken with Japanese curry", category: "Main Course", foodType: "non-veg", spiceLevel: "medium", isBestseller: true },
      { name: "Miso Soup", price: 299, description: "Tofu & seaweed", category: "Starters", foodType: "vegan", spiceLevel: "none" },
      { name: "Edamame", price: 349, description: "Steamed & salted soy beans", category: "Starters", foodType: "vegan", spiceLevel: "mild" },
    ],
  },
  {
    ownerAuth0Id: "seed|owner-spice",
    ownerEmail: "owner.spice@seed.local",
    restaurantName: "Spice Route",
    city: "London",
    country: "United Kingdom",
    deliveryPrice: 149,
    estimatedDeliveryTime: 25,
    cuisines: ["Indian", "Curry", "Biryani"],
    imageUrl: img("photo-1585937421612-70a008356fbe"),
    ratings: [5, 5, 4, 5],
    menuItems: [
      { name: "Butter Chicken", price: 1099, description: "Creamy tomato & butter gravy", category: "Main Course", foodType: "non-veg", spiceLevel: "medium", isBestseller: true },
      { name: "Paneer Tikka", price: 949, description: "Char-grilled spiced cottage cheese", category: "Main Course", foodType: "veg", spiceLevel: "hot", isBestseller: true },
      { name: "Veg Biryani", price: 899, description: "Fragrant basmati with spiced vegetables", category: "Main Course", foodType: "veg", spiceLevel: "medium" },
      { name: "Garlic Naan", price: 299, description: "Tandoor-baked with garlic", category: "Sides", foodType: "veg", spiceLevel: "none" },
      { name: "Gulab Jamun", price: 399, description: "Warm milk dumplings in syrup", category: "Desserts", foodType: "veg", spiceLevel: "none" },
    ],
  },
];

const reviewers = [
  { auth0Id: "seed|reviewer-1", email: "alex@seed.local", name: "Alex" },
  { auth0Id: "seed|reviewer-2", email: "priya@seed.local", name: "Priya" },
  { auth0Id: "seed|reviewer-3", email: "sam@seed.local", name: "Sam" },
  { auth0Id: "seed|reviewer-4", email: "mia@seed.local", name: "Mia" },
];

const comments = [
  "Absolutely delicious, will order again!",
  "Great food and quick delivery.",
  "Tasty and generous portions.",
  "Loved it — highly recommend.",
];

async function seed() {
  const conn = process.env.MONGODB_CONECTION_STRING;
  if (!conn) throw new Error("MONGODB_CONECTION_STRING is not set");
  await mongoose.connect(conn);
  console.log("connected to mongodb");

  // ensure reviewer accounts
  const reviewerDocs = [];
  for (const r of reviewers) {
    const doc = await User.findOneAndUpdate(
      { auth0Id: r.auth0Id },
      { $setOnInsert: r },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    reviewerDocs.push(doc!);
  }

  for (const data of restaurants) {
    const owner = await User.findOneAndUpdate(
      { auth0Id: data.ownerAuth0Id },
      { $setOnInsert: { auth0Id: data.ownerAuth0Id, email: data.ownerEmail } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const restaurant = await Restaurant.findOneAndUpdate(
      { restaurantName: data.restaurantName },
      {
        user: owner!._id,
        restaurantName: data.restaurantName,
        city: data.city,
        country: data.country,
        deliveryPrice: data.deliveryPrice,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        cuisines: data.cuisines,
        menuItems: data.menuItems,
        imageUrl: data.imageUrl,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // sample reviews (one per reviewer), then recompute the rating aggregate
    let sum = 0;
    for (let i = 0; i < reviewerDocs.length; i++) {
      const rating = data.ratings[i % data.ratings.length];
      await Review.updateOne(
        { user: reviewerDocs[i]._id, restaurant: restaurant!._id, menuItemId: null },
        { $set: { rating, comment: comments[i % comments.length] } },
        { upsert: true, setDefaultsOnInsert: true }
      );
      sum += rating;
    }
    restaurant!.averageRating = +(sum / reviewerDocs.length).toFixed(1);
    restaurant!.reviewCount = reviewerDocs.length;
    await restaurant!.save();

    console.log(
      `seeded "${data.restaurantName}" — ${data.menuItems.length} items, avg ${restaurant!.averageRating}★`
    );
  }

  await mongoose.disconnect();
  console.log("seed complete ✅");
}

seed().catch((e) => {
  console.error("seed failed:", e);
  process.exit(1);
});
