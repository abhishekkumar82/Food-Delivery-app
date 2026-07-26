import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import Review from "../models/review";
import Order from "../models/order";
import { aiEnabled, askClaude, parseJsonReply } from "../lib/anthropic";

// ---- Tier 3: AI meal recommender ----
// GET /api/ai/recommendations (auth)
const getRecommendations = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant", "restaurantName cuisines")
      .sort({ createdAt: -1 })
      .limit(20);

    const orderedRestaurantIds = new Set(
      orders.map((o: any) => o.restaurant?._id?.toString()).filter(Boolean)
    );
    const likedCuisines = Array.from(
      new Set(
        orders.flatMap((o: any) => o.restaurant?.cuisines || [])
      )
    );
    const orderedItems = Array.from(
      new Set(orders.flatMap((o) => o.cartItems.map((ci: any) => ci.name)))
    ).slice(0, 20);

    // candidate pool: well-rated restaurants the user hasn't ordered from
    const candidates = await Restaurant.find()
      .select("restaurantName cuisines averageRating city imageUrl")
      .sort({ averageRating: -1 })
      .limit(25);

    const fresh = candidates.filter(
      (c) => !orderedRestaurantIds.has(c._id.toString())
    );

    // ---- AI path ----
    if (aiEnabled && likedCuisines.length > 0 && fresh.length > 0) {
      try {
        const prompt = `The customer has ordered from cuisines: ${likedCuisines.join(
          ", "
        )}. Dishes they've ordered: ${orderedItems.join(", ") || "n/a"}.

Candidate restaurants (id | name | cuisines | rating):
${fresh
          .map(
            (c) =>
              `${c._id} | ${c.restaurantName} | ${(c.cuisines || []).join(
                "/"
              )} | ${c.averageRating ?? 0}`
          )
          .join("\n")}

Pick the 4 best matches for this customer. Reply ONLY with JSON:
{"recommendations":[{"restaurantId":"<id>","reason":"<one short friendly sentence>"}]}`;

        const reply = await askClaude(
          "You are a food recommendation engine. Return concise JSON only.",
          prompt,
          800
        );
        const parsed = parseJsonReply<{
          recommendations: { restaurantId: string; reason: string }[];
        }>(reply);

        if (parsed?.recommendations?.length) {
          const byId = new Map(fresh.map((c) => [c._id.toString(), c]));
          const result = parsed.recommendations
            .map((r) => {
              const restaurant = byId.get(r.restaurantId);
              return restaurant ? { restaurant, reason: r.reason } : null;
            })
            .filter(Boolean);
          if (result.length) {
            return res.json({ source: "ai", recommendations: result });
          }
        }
      } catch (e) {
        console.log("AI recommendations failed, using fallback", e);
      }
    }

    // ---- Heuristic fallback ----
    const fallback = (fresh.length ? fresh : candidates).slice(0, 4).map((c) => ({
      restaurant: c,
      reason:
        (c.averageRating ?? 0) >= 4
          ? "Highly rated by other customers"
          : "Popular pick you haven't tried yet",
    }));
    res.json({ source: "popular", recommendations: fallback });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// ---- Tier 3: natural-language search ----
// POST /api/ai/search { query }
const nlSearch = async (req: Request, res: Response) => {
  try {
    const query = String(req.body.query || "").trim();
    if (!query) return res.json({ restaurants: [], parsed: null });

    let filters: {
      cuisines: string[];
      keywords: string;
      vegOnly: boolean;
      maxPrice: number | null;
    } = { cuisines: [], keywords: query, vegOnly: false, maxPrice: null };
    let source = "text";

    if (aiEnabled) {
      try {
        const reply = await askClaude(
          "You convert a food-craving sentence into search filters. Return JSON only.",
          `Query: "${query}"
Return JSON: {"cuisines":[..],"keywords":"<dish/keywords>","vegOnly":<bool>,"maxPrice":<number in the same currency major units or null>}`,
          400
        );
        const parsed = parseJsonReply<typeof filters>(reply);
        if (parsed) {
          filters = { ...filters, ...parsed };
          source = "ai";
        }
      } catch (e) {
        console.log("AI search parse failed, using text search", e);
      }
    }

    // build a mongo query from the filters
    const and: any[] = [];
    if (filters.cuisines?.length) {
      and.push({ cuisines: { $in: filters.cuisines.map((c) => new RegExp(c, "i")) } });
    }
    if (filters.keywords) {
      const rx = new RegExp(filters.keywords.split(/\s+/).join("|"), "i");
      and.push({
        $or: [
          { restaurantName: rx },
          { cuisines: rx },
          { "menuItems.name": rx },
        ],
      });
    }
    const mongoQuery = and.length ? { $and: and } : {};

    let restaurants = await Restaurant.find(mongoQuery).limit(20);

    // veg-only / price filters applied in memory against menu items
    if (filters.vegOnly) {
      restaurants = restaurants.filter((r) =>
        r.menuItems.some((m: any) => m.foodType === "veg")
      );
    }
    if (filters.maxPrice) {
      const cap = filters.maxPrice * 100;
      restaurants = restaurants.filter((r) =>
        r.menuItems.some((m: any) => m.price <= cap)
      );
    }

    res.json({ restaurants, parsed: filters, source });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

// ---- Tier 3: review summarizer ----
// GET /api/ai/review-summary/:restaurantId (public)
const reviewSummary = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({
      restaurant: req.params.restaurantId,
      menuItemId: null,
    })
      .sort({ createdAt: -1 })
      .limit(40);

    if (reviews.length === 0) {
      return res.json({ available: false });
    }

    const avg =
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    if (aiEnabled) {
      try {
        const body = reviews
          .filter((r) => r.comment)
          .map((r) => `(${r.rating}/5) ${r.comment}`)
          .join("\n")
          .slice(0, 6000);

        if (body) {
          const reply = await askClaude(
            "You summarize restaurant reviews for a diner. Return JSON only.",
            `Reviews:\n${body}\n\nReturn JSON: {"summary":"<2 sentence overview>","pros":[".."],"cons":[".."]}`,
            600
          );
          const parsed = parseJsonReply<{
            summary: string;
            pros: string[];
            cons: string[];
          }>(reply);
          if (parsed?.summary) {
            return res.json({
              available: true,
              source: "ai",
              averageRating: +avg.toFixed(1),
              reviewCount: reviews.length,
              ...parsed,
            });
          }
        }
      } catch (e) {
        console.log("AI review summary failed, using fallback", e);
      }
    }

    // ---- Heuristic fallback ----
    const sentiment =
      avg >= 4 ? "mostly positive" : avg >= 3 ? "mixed" : "mostly critical";
    res.json({
      available: true,
      source: "stats",
      averageRating: +avg.toFixed(1),
      reviewCount: reviews.length,
      summary: `Based on ${reviews.length} reviews, feedback is ${sentiment} with an average rating of ${avg.toFixed(
        1
      )}/5.`,
      pros: [],
      cons: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

export default { getRecommendations, nlSearch, reviewSummary };
