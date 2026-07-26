import { Star } from "lucide-react";
import { useState } from "react";

type Props = {
  rating: number;
  // when set, stars become clickable and report the chosen value
  onChange?: (value: number) => void;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
};

// Reusable 5-star rating. Read-only when `onChange` is omitted, interactive otherwise.
const StarRating = ({
  rating,
  onChange,
  size = 18,
  showValue = false,
  reviewCount,
}: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hover ?? rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(display);
          return (
            <Star
              key={star}
              size={size}
              className={`${filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${
                interactive ? "cursor-pointer" : ""
              }`}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => interactive && setHover(star)}
              onMouseLeave={() => interactive && setHover(null)}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {reviewCount !== undefined && reviewCount > 0 && (
            <span className="font-normal text-gray-500">
              {" "}
              ({reviewCount})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
