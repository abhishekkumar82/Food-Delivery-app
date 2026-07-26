import { Order } from "@/types";
import OrderStatusHeader from "./OrderStatusHeader";
import OrderStatusDetail from "./orderStatusDetail";
import OrderTrackingMap from "./OrderTrackingMap";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useReorder } from "@/api/OrderApi";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";

type Props = {
  order: Order;
};

const SHOW_MAP_STATUSES = ["readyForPickup", "outForDelivery"];

const OrderTracker = ({ order }: Props) => {
  const { liveStatus, driverLocation } = useOrderTracking(
    order._id,
    order.driverLocation as any
  );
  const { reorder, isLoading: isReordering } = useReorder();
  const navigate = useNavigate();

  // reflect real-time status pushes on top of the polled order
  const effectiveOrder: Order = liveStatus
    ? { ...order, status: liveStatus }
    : order;

  const showMap = SHOW_MAP_STATUSES.includes(effectiveOrder.status);

  const handleReorder = async () => {
    const { restaurantId } = await reorder(order._id);
    navigate(`/detail/${restaurantId}`);
  };

  return (
    <div className="space-y-6 rounded-lg bg-gray-50 p-10">
      <div className="flex items-center justify-between">
        <OrderStatusHeader order={effectiveOrder} />
        <Button
          variant="outline"
          size="sm"
          disabled={isReordering}
          onClick={handleReorder}
          className="ml-4 shrink-0"
        >
          <RotateCcw size={14} className="mr-1" /> Reorder
        </Button>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <OrderStatusDetail order={effectiveOrder} />
        {showMap ? (
          <OrderTrackingMap
            driverLocation={driverLocation}
            destination={effectiveOrder.deliveryDetails?.location}
            restaurantLocation={effectiveOrder.restaurant?.location}
          />
        ) : (
          <AspectRatio ratio={16 / 5}>
            <img
              src={effectiveOrder.restaurant.imageUrl}
              className="h-full w-full rounded-md object-cover"
            />
          </AspectRatio>
        )}
      </div>

      {effectiveOrder.driver && (
        <div className="text-sm text-gray-600">
          🛵 Rider: <span className="font-semibold">{effectiveOrder.driver.name}</span>{" "}
          ({effectiveOrder.driver.vehicleType})
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
