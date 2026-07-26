import User from "../models/user";
import { notify } from "./notify";
import { emitToOrder, emitToUser } from "./socket";

const STATUS_LABELS: Record<string, string> = {
  placed: "placed",
  paid: "confirmed & paid",
  confirmed: "confirmed by the restaurant",
  inProgress: "being prepared",
  readyForPickup: "ready for pickup",
  outForDelivery: "out for delivery",
  delivered: "delivered",
  cancelled: "cancelled",
};

// Loyalty: earn 5% back as points (1 point == 1 penny / minor unit).
const LOYALTY_RATE = 0.05;

// Central place to transition an order's status: records history, awards
// loyalty on delivery, persists, emits real-time events and notifies the user.
export const applyStatusChange = async (order: any, newStatus: string) => {
  order.status = newStatus;
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({ status: newStatus, at: new Date() });

  if (newStatus === "delivered" && !order.loyaltyAwarded) {
    const points = Math.floor((order.totalAmount || 0) * LOYALTY_RATE);
    if (order.user && points > 0) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { loyaltyPoints: points },
      });
    }
    order.loyaltyEarned = points;
    order.loyaltyAwarded = true;
  }

  await order.save();

  const orderId = order._id.toString();
  const payload = { orderId, status: newStatus };
  emitToOrder(orderId, "orderStatus", payload);

  if (order.user) {
    const userId = order.user.toString();
    emitToUser(userId, "orderStatus", payload);
    await notify({
      userId,
      title: `Your order is ${STATUS_LABELS[newStatus] || newStatus}`,
      message:
        newStatus === "delivered"
          ? "Enjoy your meal! Tap to leave a review."
          : `Order status updated to "${STATUS_LABELS[newStatus] || newStatus}".`,
      type: "order",
      relatedId: orderId,
    });
  }
};

// Push a live driver-location update to everyone watching this order.
export const emitDriverLocation = (
  orderId: string,
  lat: number,
  lng: number
) => {
  emitToOrder(orderId, "driverLocation", { orderId, lat, lng, at: Date.now() });
};
