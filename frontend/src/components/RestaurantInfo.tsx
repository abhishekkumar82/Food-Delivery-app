import { Restaurant } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Dot } from "lucide-react"
import StarRating from "./StarRating"

// import React from 'react'
type Props={
   restaurant:Restaurant,
}
const RestaurantInfo = ({restaurant}:Props) => {
  return (
    <Card className="border-sla" >
    <CardHeader>
        <CardTitle>
            {restaurant.restaurantName}
        </CardTitle>
        <StarRating
          rating={restaurant.averageRating ?? 0}
          reviewCount={restaurant.reviewCount}
          showValue
          size={16}
        />
        <CardDescription>
            {restaurant.city} ,{restaurant.country}
        </CardDescription>
    </CardHeader>
    <CardContent className="flex" >
       {restaurant.cuisines.map((item,index)=>(
          <span className="flex">
            <span>{item}</span>
            {index<restaurant.cuisines.length-1 && <Dot/>}
          </span>
       ))}
    </CardContent>
    </Card>
  )
}

export default RestaurantInfo
