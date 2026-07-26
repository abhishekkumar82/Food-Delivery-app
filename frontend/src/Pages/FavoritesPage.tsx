import { useGetFavorites } from "@/api/FavoriteApi";
import SearchResultCard from "@/components/SearchResultCard";

const FavoritesPage = () => {
  const { favorites, isLoading } = useGetFavorites();

  if (isLoading) {
    return <span>Loading your favorites...</span>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Favorites</h1>
      {!favorites || favorites.length === 0 ? (
        <span className="text-gray-500">
          You haven't favorited any restaurants yet. Tap the ♥ on a restaurant to
          save it here.
        </span>
      ) : (
        <div className="flex flex-col gap-6">
          {favorites.map((restaurant) => (
            <SearchResultCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
