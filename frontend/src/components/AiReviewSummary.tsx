import { useGetReviewSummary } from "@/api/AiApi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

type Props = { restaurantId: string };

const AiReviewSummary = ({ restaurantId }: Props) => {
  const { summary, isLoading } = useGetReviewSummary(restaurantId);

  if (isLoading || !summary || !summary.available) return null;

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles size={16} className="text-orange-500" />
          {summary.source === "ai" ? "AI review summary" : "Review overview"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-gray-700">{summary.summary}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {summary.pros && summary.pros.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                <ThumbsUp size={12} /> What people love
              </span>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                {summary.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {summary.cons && summary.cons.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                <ThumbsDown size={12} /> Common gripes
              </span>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                {summary.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400">
          Based on {summary.reviewCount} reviews · avg {summary.averageRating}/5
        </span>
      </CardContent>
    </Card>
  );
};

export default AiReviewSummary;
