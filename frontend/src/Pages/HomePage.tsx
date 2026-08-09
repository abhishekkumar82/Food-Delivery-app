import landingImage from "../assets/landing.png";
import appDownloadImage from "../assets/appDownload.png";
import SearchBar, { SearchForm } from "@/components/SearchBar";
import SearchResultCard from "@/components/SearchResultCard";
import { useGetBestsellers, useSearchRestaurants } from "@/api/RestaurantApi";
import { useLocationCity } from "@/context/LocationContext";
import { SearchState } from "./SearchPage";
import { onImageError } from "@/lib/imageFallback";
import { Link, useNavigate } from "react-router-dom";

const money = (minor: number) => `£${(minor / 100).toFixed(2)}`;

const HomePage = () => {
  const navigate = useNavigate();
  // shared "deliver to" city (chosen in the navbar)
  const { city } = useLocationCity();

  const searchState: SearchState = {
    searchQuery: "",
    page: 1,
    selectedCuisines: [],
    sortOption: "averageRating",
  };
  const { results, isLoading } = useSearchRestaurants(searchState, city);
  const { bestsellers } = useGetBestsellers(city);

  const handleSearchSubmit = (v: SearchForm) => {
    navigate(`/search/${v.searchQuery}`);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="bg-white md:px-32 rounded-lg shadow-md py-8 flex flex-col gap-5 text-center -mt-16">
        <h1 className="text-5xl font-bold tracking-tight text-orange-600">
          Tuck into a takeaway today
        </h1>
        <span className="text-xl">
          Showing food in <span className="font-bold text-orange-600">{city}</span> — change it from the top bar.
        </span>
        <SearchBar
          searchQuery=""
          placeHolder="Search by city or town"
          onSubmit={handleSearchSubmit}
        />
      </div>

      {/* Bestseller dishes in the chosen city */}
      {bestsellers && bestsellers.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">
            🔥 Bestsellers in {city}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {bestsellers.map((dish, i) => (
              <Link
                key={i}
                to={`/detail/${dish.restaurantId}`}
                className="w-44 shrink-0 rounded-lg border transition hover:border-orange-300"
              >
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  onError={onImageError}
                  className="h-28 w-full rounded-t-lg object-cover"
                />
                <div className="flex flex-col gap-0.5 p-2">
                  <span className="truncate text-sm font-semibold">{dish.name}</span>
                  <span className="text-sm font-bold text-orange-600">
                    {money(dish.price)}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {dish.restaurantName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top restaurants in the chosen city */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Top restaurants in {city}
          </h2>
          <Link
            to={`/search/${city}`}
            className="font-bold text-orange-500 hover:underline"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <span>Loading restaurants...</span>
        ) : !results?.data?.length ? (
          <span className="text-gray-500">
            No restaurants in {city} yet — pick another city from the top bar.
          </span>
        ) : (
          <div className="grid gap-6">
            {results.data.map((restaurant) => (
              <SearchResultCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>

      {/* app download */}
      <div className="grid md:grid-cols-2 gap-5">
        <img src={landingImage} alt="A freshly prepared meal" />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <span className="font-bold text-3xl tracking-tighter">
            Order takeaway even faster!
          </span>
          <span>
            Download the MernEats App for faster ordering and personalised
            recommendations
          </span>
          <img src={appDownloadImage} alt="Download the MernEats app" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
