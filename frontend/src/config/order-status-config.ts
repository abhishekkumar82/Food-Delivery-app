import { OrderStatus } from "@/types";

type OrderStatusInfo = {
  label: string;
  value: OrderStatus;
  progressValue: number;
};

export const ORDER_STATUS: OrderStatusInfo[] = [
  { label: "Placed", value: "placed", progressValue: 0 },
  {
    label: "Awaiting Restaurant Confirmation",
    value: "paid",
    progressValue: 20,
  },
  { label: "Confirmed", value: "confirmed", progressValue: 35 },
  { label: "In Progress", value: "inProgress", progressValue: 50 },
  { label: "Ready for Pickup", value: "readyForPickup", progressValue: 65 },
  { label: "Out for Delivery", value: "outForDelivery", progressValue: 80 },
  { label: "Delivered", value: "delivered", progressValue: 100 },
  { label: "Cancelled", value: "cancelled", progressValue: 100 },
];
