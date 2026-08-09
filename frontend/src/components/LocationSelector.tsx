import { useGetCities } from "@/api/RestaurantApi";
import { useLocationCity } from "@/context/LocationContext";
import { ChevronDown, Loader2, MapPin, Navigation, Search } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);

  const list = cities && cities.length ? cities : [city];
  const filtered = list.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase())
  );

  const pick = (c: string) => {
    setCity(c);
    setQuery("");
    setOpen(false);
  };

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
          const hay = (
            (data.display_name || "") +
            " " +
            JSON.stringify(data.address || {})
          ).toLowerCase();

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
            setOpen(false);
            toast.success(`📍 Delivering to ${match}`);
          } else {
            const detected =
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              data.address?.county ||
              "your area";
            toast.error(
              `No restaurants near ${detected} yet — search another city.`
            );
          }
        } catch {
          toast.error("Couldn't detect your city, please search instead.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        toast.error("Location permission denied — search a city instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 font-bold text-orange-600"
        title="Change delivery city"
      >
        <MapPin size={18} className="text-orange-500" />
        {city}
        <ChevronDown size={16} />
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border bg-white p-2 text-left shadow-lg">
            {/* search */}
            <div className="flex items-center gap-2 rounded-md border px-2">
              <Search size={14} className="text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a city..."
                className="w-full py-1.5 text-sm outline-none"
              />
            </div>

            {/* use my location */}
            <button
              type="button"
              onClick={detect}
              disabled={detecting}
              className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-60"
            >
              {detecting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Navigation size={14} />
              )}
              {detecting ? "Detecting…" : "Use my current location"}
            </button>

            <div className="my-1 border-t" />

            {/* city list */}
            <div className="max-h-56 overflow-y-auto">
              {filtered.length ? (
                filtered.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => pick(c)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50 ${
                      c === city ? "font-bold text-orange-600" : "text-gray-700"
                    }`}
                  >
                    <MapPin size={13} className="text-gray-400" />
                    {c}
                  </button>
                ))
              ) : (
                <span className="block px-2 py-2 text-sm text-gray-400">
                  No city found
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationSelector;
