import { useCreateReview, useGetRestaurantReviews } from "@/api/ReviewApi";
import { Review } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import StarRating from "./StarRating";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

type Props = {
  restaurantId: string;
};

const reviewerName = (review: Review) =>
  typeof review.user === "object" && review.user?.name
    ? review.user.name
    : "Anonymous";

const ReviewSection = ({ restaurantId }: Props) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { reviews, isLoading } = useGetRestaurantReviews(restaurantId);
  const { createReview, isLoading: isSubmitting } = useCreateReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) return;
    await createReview({ restaurantId, rating, comment });
    setRating(0);
    setComment("");
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-2xl font-bold tracking-tight">
        Ratings & Reviews
      </span>

      {/* Write a review */}
      {isAuthenticated ? (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <span className="font-semibold">Leave a review</span>
          <StarRating rating={rating} onChange={setRating} size={26} />
          <textarea
            className="min-h-[80px] resize-none rounded-md border p-2 text-sm"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            className="w-fit bg-orange-500"
            disabled={rating === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit review"}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => loginWithRedirect()}
        >
          Log in to leave a review
        </Button>
      )}

      {/* Existing reviews */}
      {isLoading ? (
        <span className="text-gray-500">Loading reviews...</span>
      ) : reviews && reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review._id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{reviewerName(review)}</span>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <StarRating rating={review.rating} size={14} />
              {review.comment && (
                <p className="text-sm text-gray-600">{review.comment}</p>
              )}
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <span className="text-gray-500">
          No reviews yet — be the first to review!
        </span>
      )}
    </div>
  );
};

export default ReviewSection;
