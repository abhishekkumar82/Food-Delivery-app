// import React from 'react'
import { menuItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { FOOD_TYPES } from "@/config/menu-options-config";
import StarRating from "./StarRating";

type Props = {
  menuItem: menuItem;
  addToCart: () => void;
};

// Classic veg/non-veg square indicator (green box = veg, red = non-veg, etc.)
const FoodTypeIndicator = ({ menuItem }: { menuItem: menuItem }) => {
  const type = FOOD_TYPES.find((t) => t.value === (menuItem.foodType ?? "veg"));
  if (!type) return null;
  return (
    <span
      className="flex h-4 w-4 items-center justify-center rounded-sm border-2"
      style={{ borderColor: type.color }}
      title={type.label}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: type.color }}
      />
    </span>
  );
};

const MenuItem = ({ menuItem, addToCart }: Props) => {
  const outOfStock = menuItem.inStock === false;

  return (
    <Card
      className={`${outOfStock ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      onClick={outOfStock ? undefined : addToCart}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FoodTypeIndicator menuItem={menuItem} />
          {menuItem.name}
          {menuItem.isBestseller && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              ⭐ Bestseller
            </Badge>
          )}
          {outOfStock && (
            <Badge variant="outline" className="text-red-500">
              Out of stock
            </Badge>
          )}
        </CardTitle>
        {menuItem.averageRating !== undefined && menuItem.averageRating > 0 && (
          <StarRating
            rating={menuItem.averageRating}
            reviewCount={menuItem.reviewCount}
            showValue
            size={13}
          />
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="font-bold">${(menuItem.price / 100).toFixed(2)}</span>
        {menuItem.description && (
          <span className="text-sm font-normal text-gray-500">
            {menuItem.description}
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuItem;
