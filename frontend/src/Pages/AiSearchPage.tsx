import { useAiSearch } from "@/api/AiApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const EXAMPLES = [
  "cheap spicy vegetarian dinner",
  "healthy lunch under £10",
  "late night pizza",
];

const AiSearchPage = () => {
  const [query, setQuery] = useState("");
  const { search, isLoading, data } = useAiSearch();

  const run = (q: string) => {
    setQuery(q);
    if (q.trim()) search(q).catch(() => {});
  };

  const restaurants = data?.restaurants || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Ask in plain English</h1>
          <p className="text-sm text-gray-500">
            Describe what you're craving and we'll find it.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. cheap spicy vegetarian dinner"
          onKeyDown={(e) => e.key === "Enter" && run(query)}
        />
        <Button
          className="bg-orange-500"
          disabled={isLoading}
          onClick={() => run(query)}
        >
          {isLoading ? "Thinking..." : "Search"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => run(ex)}
            className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:border-orange-300"
          >
            {ex}
          </button>
        ))}
      </div>

      {data && (
        <div className="flex flex-col gap-3">
          <span className="text-sm text-gray-500">
            {restaurants.length} result{restaurants.length === 1 ? "" : "s"}
            {data.source === "ai" && " · understood by AI"}
          </span>
          <div className="grid gap-4 md:grid-cols-2">
            {restaurants.map((restaurant) => (
              <Link key={restaurant._id} to={`/detail/${restaurant._id}`}>
                <Card className="h-full transition hover:border-orange-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {restaurant.restaurantName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {(restaurant.cuisines || []).slice(0, 3).join(" · ")} ·{" "}
                      {restaurant.city}
                    </p>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-500">
                    Delivery from £
                    {(restaurant.deliveryPrice / 100).toFixed(2)}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSearchPage;
