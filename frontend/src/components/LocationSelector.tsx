import { useGetCities } from "@/api/RestaurantApi";
import { useLocationCity } from "@/context/LocationContext";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Nominatim sometimes returns a city's official name; map those to our data.
const ALIASES: Record<string, string> = {
  gurugram: "gurgaon",
  bangalore: "bengaluru",
};

const LocationSelector = () => {
  const { city, setCity } = useLocationCity();
  const { cities } = useGetCities();
  const [detecting, setDetecting] = useState(false);

  // FREE: browser geolocation + OpenStreetMap Nominatim reverse geocoding.
  const detect = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser doesn't support location.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
            { headers: { Accept: "application/json" } }
          );
          const data = await res.json();
          const list = cities && cities.length ? cities : [];
          const hay = (
            (data.display_name || "") +
            " " +
            JSON.stringify(data.address || {})
          ).toLowerCase();

          // match one of our delivery cities inside the resolved address
          let match = list.find((c) => hay.includes(c.toLowerCase()));
          if (!match) {
            for (const [alias, canonical] of Object.entries(ALIASES)) {
              if (hay.includes(alias)) {
                match = list.find((c) => c.toLowerCase() === canonical);
                if (match) break;
              }
            }
          }

          if (match) {
            setCity(match);
            toast.success(`📍 Delivering to ${match}`);
          } else {
            const detected =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              data.address?.county ||
              "your area";
            toast.error(`No restaurants near ${detected} yet — showing ${city}.`);
          }
        } catch {
          toast.error("Couldn't detect your city, please try again.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        toast.error("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex items-center gap-1.5">
      <MapPin size={18} className="text-orange-500" />
      <span className="font-bold text-orange-600">{city}</span>
      <button
        type="button"
        onClick={detect}
        disabled={detecting}
        title="Use my current location"
        className="ml-1 flex items-center gap-1 rounded-full border border-orange-500 px-2 py-0.5 text-xs font-semibold text-orange-500 hover:bg-orange-50 disabled:opacity-60"
      >
        {detecting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Navigation size={14} />
        )}
        {detecting ? "Locating…" : "Use my location"}
      </button>
    </div>
  );
};

export default LocationSelector;
