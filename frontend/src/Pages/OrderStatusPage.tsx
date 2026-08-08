import { useCancelOrder, useGetMyOrders } from "@/api/OrderApi";
import OrderTracker from "@/components/OrderTracker";
import { Button } from "@/components/ui/button";

// statuses at which a customer can still cancel (before the kitchen/rider commits)
const CANCELLABLE = ["placed", "paid", "confirmed"];

const OrderStatusPage = () => {
  const { orders, isLoading } = useGetMyOrders();
  const { cancelOrder, isLoading: isCancelling } = useCancelOrder();

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!orders || orders.length === 0) {
    return <span>No orders found.</span>;
  }

  return (
    <div className="space-y-10">
      {orders.map((order) => (
        <div key={order._id} className="space-y-3">
          <OrderTracker order={order} />
          {CANCELLABLE.includes(order.status) && (
            <Button
              variant="outline"
              className="text-red-500"
              disabled={isCancelling}
              onClick={() => cancelOrder(order._id as string)}
            >
              Cancel order
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStatusPage;
