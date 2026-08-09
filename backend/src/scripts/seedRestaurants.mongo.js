// Bulk restaurant seeder — runs directly in mongosh (fast & reliable).
// Usage:  mongosh food_odering_database --file src/scripts/seedRestaurants.mongo.js
//
// - deletes restaurants whose dishes have no image (old/placeholder data)
// - (re)generates ~300 restaurants across UK + India cities, each with a full
//   menu (with dish images) owned by one of 40 partner accounts.

const TOTAL = 300;
const OWNERS = 40;
const img = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

const CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Bristol", "Liverpool",
  "Noida", "Delhi", "Gurgaon", "Mumbai", "Bengaluru", "Pune",
];

const CUISINES = {
  Italian: { banner: "photo-1513104890138-7c749659a591", dishes: [["Margherita Pizza",899],["Pepperoni Pizza",1049],["Spaghetti Carbonara",999],["Lasagne",1149],["Garlic Bread",399],["Tiramisu",499]] },
  Indian: { banner: "photo-1585937421612-70a008356fbe", dishes: [["Butter Chicken",1099],["Paneer Tikka",949],["Chicken Biryani",1049],["Garlic Naan",299],["Dal Makhani",849],["Gulab Jamun",399]] },
  Chinese: { banner: "photo-1585032226651-759b368d7246", dishes: [["Kung Pao Chicken",999],["Veg Spring Rolls",449],["Egg Fried Rice",699],["Chow Mein",849],["Szechuan Tofu",899],["Wonton Soup",549]] },
  Japanese: { banner: "photo-1579584425555-c3ce17fd4351", dishes: [["Salmon Nigiri (6pc)",750],["California Roll",699],["Chicken Katsu Curry",1199],["Miso Soup",299],["Edamame",349],["Gyoza (5pc)",599]] },
  American: { banner: "photo-1568901346375-23c9450c58cd", dishes: [["Classic Cheeseburger",999],["Bacon Double Burger",1249],["BBQ Ribs",1399],["Buffalo Wings",849],["Loaded Fries",599],["Brownie Sundae",549]] },
  Mexican: { banner: "photo-1565299624946-b28f40a0ae38", dishes: [["Chicken Tacos (3pc)",849],["Beef Burrito",999],["Loaded Nachos",699],["Quesadilla",799],["Guacamole & Chips",549],["Churros",449]] },
  "North Indian": { banner: "photo-1585937421612-70a008356fbe", dishes: [["Paneer Butter Masala",289],["Dal Makhani",249],["Shahi Paneer",279],["Butter Naan",69],["Chole Bhature",199],["Kadai Chicken",329]] },
  "South Indian": { banner: "photo-1630383249896-424e482df921", dishes: [["Masala Dosa",149],["Idli Sambar (4pc)",129],["Medu Vada (2pc)",119],["Uttapam",159],["Filter Coffee",69],["Lemon Rice",139]] },
  Biryani: { banner: "photo-1631515243349-e0cb75fb8d3a", dishes: [["Chicken Biryani",299],["Mutton Biryani",399],["Veg Biryani",219],["Hyderabadi Dum Biryani",349],["Chicken 65",229],["Raita",79]] },
  "Street Food": { banner: "photo-1601050690597-df0568f70950", dishes: [["Pani Puri (6pc)",79],["Vada Pav (2pc)",99],["Pav Bhaji",169],["Aloo Tikki Chaat",119],["Samosa Chaat",129],["Bhel Puri",99]] },
};
const CUISINE_NAMES = Object.keys(CUISINES);
const DISH_IMAGES = ["photo-1568901346375-23c9450c58cd","photo-1513104890138-7c749659a591","photo-1546069901-ba9599a7e63c","photo-1551183053-bf91a1d81141","photo-1567620905732-2d1ec7ab7445","photo-1565299624946-b28f40a0ae38","photo-1504674900247-0877df9cc836","photo-1476224203421-9ac39bcb3327"];
const ADJ = ["Golden","Royal","Urban","Rustic","Spicy","Green","Blue","Little","Grand","Cosy","Corner","Twin","Royal","Saffron","Tandoori"];
const NOUN = ["Spoon","Kitchen","Table","Bites","Grill","Garden","House","Bistro","Feast","Pantry","Diner","Plate","Darbar","Junction"];
const FOOD_TYPES = ["veg","non-veg","egg","vegan"];
const SPICE = ["none","mild","medium","hot"];
const CATEGORIES = ["Starters","Main Course","Sides","Desserts"];
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1) cleanup: drop restaurants with any image-less dish or empty menu
const del = db.restaurants.deleteMany({ $or: [
  { menuItems: { $size: 0 } },
  { menuItems: { $elemMatch: { $or: [ { imageUrl: { $exists: false } }, { imageUrl: "" }, { imageUrl: null } ] } } },
] });
print("deleted image-less restaurants: " + del.deletedCount);

// 2) drop previously bulk-generated restaurants (re-runnable)
const oldOwners = db.users.find({ auth0Id: /^seed\|bulk-owner-/ }).toArray().map(u => u._id);
if (oldOwners.length) db.restaurants.deleteMany({ user: { $in: oldOwners } });

// 3) owners
const ownerIds = [];
for (let i = 1; i <= OWNERS; i++) {
  const auth0Id = "seed|bulk-owner-" + i;
  db.users.updateOne(
    { auth0Id },
    { $set: { role: "owner" }, $setOnInsert: { auth0Id, email: "bulkowner" + i + "@seed.local", name: "Owner " + i, partnerFeePaid: false } },
    { upsert: true }
  );
  ownerIds.push(db.users.findOne({ auth0Id })._id);
}

// 4) restaurants
const usedNames = {};
const restaurantName = () => {
  let n;
  do { n = (Math.random() < 0.5 ? "The " : "") + rand(ADJ) + " " + rand(NOUN); } while (usedNames[n]);
  usedNames[n] = 1;
  return n;
};

const docs = [];
for (let i = 0; i < TOTAL; i++) {
  const primary = rand(CUISINE_NAMES);
  const cuisines = Array.from(new Set([primary, rand(CUISINE_NAMES)]));
  const pool = cuisines.reduce((a, c) => a.concat(CUISINES[c].dishes), []);
  const chosen = pool.slice().sort(() => Math.random() - 0.5).slice(0, randInt(5, 6));
  const menuItems = chosen.map((d) => ({
    _id: new ObjectId(),
    name: d[0],
    price: Math.max(49, d[1] + randInt(-40, 150)),
    description: "Freshly prepared " + d[0].toLowerCase() + ".",
    imageUrl: img(rand(DISH_IMAGES)),
    category: rand(CATEGORIES),
    foodType: rand(FOOD_TYPES),
    spiceLevel: rand(SPICE),
    inStock: Math.random() < 0.95,
    isBestseller: Math.random() < 0.25,
    addOns: [],
    averageRating: 0,
    reviewCount: 0,
  }));
  docs.push({
    user: ownerIds[i % OWNERS],
    restaurantName: restaurantName(),
    city: rand(CITIES),
    country: "United Kingdom",
    deliveryPrice: randInt(0, 4) * 50 + 99,
    estimatedDeliveryTime: randInt(20, 50),
    cuisines,
    menuItems,
    imageUrl: img(CUISINES[primary].banner),
    averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    reviewCount: randInt(5, 320),
    lastUpdated: new Date(),
    location: {},
    openingHours: [],
    isOpenOverride: "auto",
  });
}
db.restaurants.insertMany(docs);
print("inserted restaurants: " + docs.length);
print("total restaurants now: " + db.restaurants.countDocuments());
