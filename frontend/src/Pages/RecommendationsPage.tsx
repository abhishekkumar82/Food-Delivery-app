import { useGetRecommendations } from "@/api/AiApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const RecommendationsPage = () => {
  const { data, isLoading } = useGetRecommendations();

  if (isLoading) return <span>Finding dishes you'll love...</span>;

  const recs = data?.recommendations || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Recommended for you</h1>
          <p className="text-sm text-gray-500">
            {data?.source === "ai"
              ? "Personalised by AI from your order history"
              : "Popular picks to get you started"}
          </p>
        </div>
      </div>

      {recs.length === 0 ? (
        <p className="text-gray-500">
          Order a few times and we'll tailor recommendations to your taste.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recs.map(({ restaurant, reason }) => (
            <Link key={restaurant._id} to={`/detail/${restaurant._id}`}>
              <Card className="h-full transition hover:border-orange-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {restaurant.restaurantName}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {(restaurant.cuisines || []).slice(0, 3).join(" · ")}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="flex items-start gap-1 text-sm text-orange-700">
                    <Sparkles size={14} className="mt-0.5 shrink-0" />
                    {reason}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
