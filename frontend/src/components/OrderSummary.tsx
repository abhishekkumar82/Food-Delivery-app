import { CartItem } from "@/Pages/DetailPage";
import { Restaurant } from "@/types";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Trash } from "lucide-react";

type Props = {
  restaurant: Restaurant;
  cartItems: CartItem[];
  removeFromCart: (cartItem: CartItem) => void;
  discountAmount?: number;
  walletApplied?: number;
};

const OrderSummary = ({
  restaurant,
  cartItems,
  removeFromCart,
  discountAmount = 0,
  walletApplied = 0,
}: Props) => {
  const getTotalCost = () => {
    const totalInPence = cartItems.reduce(
      (total, cartItem) => total + cartItem.price * cartItem.quantity,
      0
    );
    const totalWithDelivery =
      totalInPence + restaurant.deliveryPrice - discountAmount - walletApplied;

    return (Math.max(0, totalWithDelivery) / 100).toFixed(2);
  };
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight flex justify-between ">
          <span>Your Order</span>
          <span>£{getTotalCost()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {cartItems.map((item) => (
          <div className="flex justify-between" key={item._id}>
            <span>
              <Badge variant="outline" className="mr-2">
                {item.quantity}
              </Badge>
              {item.name}
            </span>
            <span className="flex items-center gap-1">
              <Trash
                className="cursor-pointer"
                color="red"
                size={20}
                onClick={() => removeFromCart(item)}
              />
              <span>£{((item.price * item.quantity) / 100).toFixed(2)}</span>
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between">
          <span>Delivery</span>
          <span> £{(restaurant.deliveryPrice / 100).toFixed(2)} </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon discount</span>
            <span>-£{(discountAmount / 100).toFixed(2)}</span>
          </div>
        )}
        {walletApplied > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Wallet</span>
            <span>-£{(walletApplied / 100).toFixed(2)}</span>
          </div>
        )}
        <Separator />
      </CardContent>
    </>
  );
};

export default OrderSummary;
