import { useGetFavorites, useToggleFavorite } from "@/api/FavoriteApi";
import { useAuth0 } from "@auth0/auth0-react";
import { Heart } from "lucide-react";

type Props = {
  restaurantId: string;
  className?: string;
};

// Heart toggle to add/remove a restaurant from favorites.
const FavoriteButton = ({ restaurantId, className }: Props) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { favorites } = useGetFavorites();
  const { toggleFavorite, isLoading } = useToggleFavorite();

  const isFavorite = !!favorites?.some((r) => r._id === restaurantId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }
    await toggleFavorite({ restaurantId, isFavorite });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`rounded-full bg-white/90 p-2 shadow transition hover:scale-110 ${className ?? ""}`}
    >
      <Heart
        size={20}
        className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
      />
    </button>
  );
};

export default FavoriteButton;
