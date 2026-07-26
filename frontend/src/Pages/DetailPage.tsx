// import React from 'react'

import { useCreateCheckoutSession, useCreateCodOrder } from "@/api/OrderApi";
import { useGetRestaurant } from "@/api/RestaurantApi";
import { useGetMyCart, useUpdateMyCart } from "@/api/CartApi";
import CheckoutButton from "@/components/CheckoutButton";
import CheckoutOptions, { CheckoutSelections } from "@/components/CheckoutOptions";
import MenuItem from "@/components/MenuItem";
import OrderSummary from "@/components/OrderSummary";
import RestaurantInfo from "@/components/RestaurantInfo";
import ReviewSection from "@/components/ReviewSection";
import { Card, CardFooter } from "@/components/ui/card";
import { UserFormData } from "@/forms/user-profile-form/UserProfileForm";
import { menuItem } from "@/types";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


export type CartItem={
    _id:string,
    name:string,
    price:number,
    quantity:number,
}

const DetailPage = () => {
  const {restaurantId}=useParams();
  const navigate=useNavigate();
  const {restaurant,isLoading}=useGetRestaurant(restaurantId);
  const {createCheckoutSession,isLoading:isCheckoutLoading}=useCreateCheckoutSession();
  const {createCodOrder,isLoading:isCodLoading}=useCreateCodOrder();
  const {isAuthenticated}=useAuth0();
  // Tier 2: coupon / wallet / payment method / scheduling selections
  const [selections,setSelections]=useState<CheckoutSelections>({
    paymentMethod:"card",
    discountAmount:0,
    walletApplied:0,
  });
  // persistent server-side cart (Tier 1) — only used when logged in
  const {cart:serverCart}=useGetMyCart();
  const {updateCart}=useUpdateMyCart();
   const [cartItems,setCartItems]=useState<CartItem[]>(()=>{
      const storedCartItems=sessionStorage.getItem(`cartItems-${restaurantId}`);
      return storedCartItems ? JSON.parse(storedCartItems):[];
   });

  // Hydrate from the saved server cart once, if it's for this restaurant and
  // the local cart is empty (so we don't clobber an in-progress guest cart).
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !isAuthenticated || !serverCart) return;
    const serverRestaurantId =
      typeof serverCart.restaurant === "object" && serverCart.restaurant
        ? serverCart.restaurant._id
        : serverCart.restaurant;
    if (
      serverRestaurantId === restaurantId &&
      serverCart.items.length > 0 &&
      cartItems.length === 0
    ) {
      setCartItems(
        serverCart.items.map((item) => ({
          _id: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      );
    }
    hydratedRef.current = true;
  }, [isAuthenticated, serverCart, restaurantId, cartItems.length]);

  // Push cart changes to the backend so they survive refresh / device switch.
  const syncCart = (items: CartItem[]) => {
    if (!isAuthenticated || !restaurantId) return;
    updateCart({
      restaurantId,
      items: items.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    }).catch(() => {});
  };

const addToCart = (menuItem: menuItem) => {
    setCartItems((prevCartItems) => {
      const existingCartItem = prevCartItems.find(
        (cartItem) => cartItem._id === menuItem._id
      );

      let updatedCartItems;

      if (existingCartItem) {
        updatedCartItems = prevCartItems.map((cartItem) =>
          cartItem._id === menuItem._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updatedCartItems = [
          ...prevCartItems,
          {
            _id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ];
      }

      sessionStorage.setItem(
        `cartItems-${restaurantId}`,
        JSON.stringify(updatedCartItems)
      );
      syncCart(updatedCartItems);

      return updatedCartItems;
    });
  };

 const removeFromCart=(cartItem:CartItem)=>{
    setCartItems((prevCartItems)=>{
        const updatedCartItems=prevCartItems.filter(
            (item)=>cartItem._id !==item._id
        );
        sessionStorage.setItem(
          `cartItems-${restaurantId}`,
          JSON.stringify(updatedCartItems)
        );
        syncCart(updatedCartItems);
        return updatedCartItems;
    })
 }
    const onCheckout= async (userFormData:UserFormData)=>{
      if(!restaurant) {
        return;
      }
      const checkoutData={
        cartItems:cartItems.map((cartItem)=>({
          menuItemId:cartItem._id,
          name:cartItem.name,
          quantity:cartItem.quantity.toString(),
        })),
        restaurantId:restaurant._id,
        deliveryDetails:{
          name:userFormData.name,
          addressLine1:userFormData.addressLine1,
          city:userFormData.city,
          country:userFormData.country,
          email:userFormData.email as string
        },
        // ---- Tier 2 checkout selections ----
        couponCode:selections.couponCode,
        walletApplied:selections.walletApplied,
        scheduledFor:selections.scheduledFor,
        paymentMethod:selections.paymentMethod,
        // ---- Tier 3 ----
        ecoPackaging:selections.ecoPackaging,
      };

      if(selections.paymentMethod==="card"){
        const data= await createCheckoutSession(checkoutData)
        window.location.href=data.url;
      } else {
        // COD / UPI — order is created server-side, no Stripe redirect
        await createCodOrder(checkoutData);
        sessionStorage.removeItem(`cartItems-${restaurantId}`);
        setCartItems([]);
        navigate("/order-status");
      }
    }

    const subtotal=cartItems.reduce((t,ci)=>t+ci.price*ci.quantity,0);


  if(isLoading || !restaurant){
      return "Loading...";
  }
return (
  <>
    <div className="flex flex-col gap-10" >
        <AspectRatio ratio={16/5}>
           <img src={restaurant.imageUrl} className="rounded-md object-cover h-full w-full" />
        </AspectRatio>
        <div className="grid md:grid-cols-[4fr_2fr] gap-5 md:px-32" >
            <div className="flex flex-col gap-4">
                 <RestaurantInfo restaurant={restaurant} />
                 <span className="text-2xl font-bold tracking-tight">Menu</span>
                 {restaurant.menuItems.map((menuItem)=>(
                    <MenuItem menuItem={menuItem} addToCart={()=>addToCart(menuItem)} />
                 ))}
                 <ReviewSection restaurantId={restaurant._id} />
            </div>
<div>
    <Card>
        <OrderSummary restaurant={restaurant} cartItems={cartItems} removeFromCart={removeFromCart} discountAmount={selections.discountAmount} walletApplied={selections.walletApplied} />
        {cartItems.length>0 && (
          <CheckoutOptions subtotal={subtotal} restaurantId={restaurant._id} onChange={setSelections} />
        )}
        <CardFooter>
      <CheckoutButton disabled={cartItems.length==0} onCheckout={onCheckout} isLoading={isCheckoutLoading||isCodLoading}/>
    </CardFooter>
    </Card>
</div>
        </div>
    </div>
    </>
)
}
export default DetailPage
