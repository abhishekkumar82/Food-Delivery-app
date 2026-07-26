import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { OrderStatus } from "@/types";

type LiveLocation = { lat: number; lng: number } | null;

// Subscribe to real-time status + driver-location updates for one order.
export const useOrderTracking = (
  orderId?: string,
  initialLocation?: LiveLocation
) => {
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);
  const [driverLocation, setDriverLocation] = useState<LiveLocation>(
    initialLocation ?? null
  );

  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    socket.emit("joinOrder", orderId);

    const onStatus = (payload: { orderId: string; status: OrderStatus }) => {
      if (payload.orderId === orderId) setLiveStatus(payload.status);
    };
    const onLocation = (payload: {
      orderId: string;
      lat: number;
      lng: number;
    }) => {
      if (payload.orderId === orderId)
        setDriverLocation({ lat: payload.lat, lng: payload.lng });
    };

    socket.on("orderStatus", onStatus);
    socket.on("driverLocation", onLocation);

    return () => {
      socket.emit("leaveOrder", orderId);
      socket.off("orderStatus", onStatus);
      socket.off("driverLocation", onLocation);
    };
  }, [orderId]);

  return { liveStatus, driverLocation };
};
