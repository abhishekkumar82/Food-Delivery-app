import { useGetCities } from "@/api/RestaurantApi";
import { useLocationCity } from "@/context/LocationContext";
import { MapPin } from "lucide-react";

const LocationSelector = () => {
  const { city, setCity } = useLocationCity();
  const { cities } = useGetCities();
  const options = cities && cities.length ? cities : [city];

  return (
    <div className="flex items-center gap-1" title="Choose delivery city">
      <MapPin size={18} className="text-orange-500" />
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="cursor-pointer bg-transparent font-bold text-orange-600 outline-none"
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationSelector;
