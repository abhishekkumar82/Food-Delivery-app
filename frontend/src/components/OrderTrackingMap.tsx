import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat?: number; lng?: number } | null | undefined;

type Props = {
  driverLocation?: LatLng;
  destination?: LatLng;
  restaurantLocation?: LatLng;
};

// emoji markers avoid Leaflet's broken default-icon image paths under bundlers
const emojiIcon = (emoji: string) =>
  L.divIcon({
    html: `<div style="font-size:26px;line-height:26px">${emoji}</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const toTuple = (p: LatLng): [number, number] | null =>
  p && typeof p.lat === "number" && typeof p.lng === "number"
    ? [p.lat, p.lng]
    : null;

const OrderTrackingMap = ({
  driverLocation,
  destination,
  restaurantLocation,
}: Props) => {
  const driver = toTuple(driverLocation);
  const dest = toTuple(destination);
  const rest = toTuple(restaurantLocation);

  const center = driver || dest || rest;
  if (!center) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
        Live map appears once your rider shares their location.
      </div>
    );
  }

  const line = [driver, dest].filter(Boolean) as [number, number][];

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {rest && (
        <Marker position={rest} icon={emojiIcon("🍴")}>
          <Popup>Restaurant</Popup>
        </Marker>
      )}
      {driver && (
        <Marker position={driver} icon={emojiIcon("🛵")}>
          <Popup>Your rider</Popup>
        </Marker>
      )}
      {dest && (
        <Marker position={dest} icon={emojiIcon("🏠")}>
          <Popup>Delivery address</Popup>
        </Marker>
      )}
      {line.length === 2 && (
        <Polyline positions={line} pathOptions={{ color: "#f97316", dashArray: "6" }} />
      )}
    </MapContainer>
  );
};

export default OrderTrackingMap;
