import landingImage from "../assets/landing.png";
import appDownloadImage from "../assets/appDownload.png";
import SearchBar, { SearchForm } from "@/components/SearchBar";
import SearchResultCard from "@/components/SearchResultCard";
import { useGetCities, useSearchRestaurants } from "@/api/RestaurantApi";
import { SearchState } from "./SearchPage";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const { cities } = useGetCities();
  // remember the customer's chosen delivery city
  const [city, setCity] = useState(
    () => localStorage.getItem("deliverCity") || "London"
  );

  const searchState: SearchState = {
    searchQuery: "",
    page: 1,
    selectedCuisines: [],
    sortOption: "averageRating", // show the best-rated first
  };
  const { results, isLoading } = useSearchRestaurants(searchState, city);

  const changeCity = (c: string) => {
    setCity(c);
    localStorage.setItem("deliverCity", c);
  };

  const handleSearchSubmit = (v: SearchForm) => {
    navigate(`/search/${v.searchQuery}`);
  };

  const cityOptions = cities && cities.length ? cities : [city];

  return (
    <div className="flex flex-col gap-12">
      <div className="bg-white md:px-32 rounded-lg shadow-md py-8 flex flex-col gap-5 text-center -mt-16">
        <h1 className="text-5xl font-bold tracking-tight text-orange-600">
          Tuck into a takeaway today
        </h1>
        <span className="text-xl">Food is just a click away!</span>

        {/* Deliver-to location selector */}
        <div className="flex items-center justify-center gap-2 text-lg">
          <MapPin className="text-orange-500" />
          <span className="font-semibold">Deliver to</span>
          <select
            value={city}
            onChange={(e) => changeCity(e.target.value)}
            className="rounded-md border-2 border-orange-500 bg-white px-3 py-1 font-bold text-orange-600"
          >
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <SearchBar
          searchQuery=""
          placeHolder="Search by city or town"
          onSubmit={handleSearchSubmit}
        />
      </div>

      {/* Restaurants in the chosen city — shown immediately, no extra search */}
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
            No restaurants in {city} yet — try another city above.
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
