import { SearchState } from "@/Pages/SearchPage";
import { Restaurant, RestaurantSearchResponse } from "@/types";
import { useQuery } from "react-query";

const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;
 
export const useGetRestaurant=(restaurantId?:string)=>{

   const  getMyRestaurantByIdRequest=async():Promise<Restaurant> =>{
       const response =await fetch(
        `${API_BASE_URL}/api/restaurant/${restaurantId}`
       );
       if(!response.ok){
        throw new Error("Failed to get restaurant");
       }
     return response.json();
   };
    const {data:restaurant,isLoading}=useQuery("fetchRestaurant",getMyRestaurantByIdRequest,{enabled:!!restaurantId,})
    return {
        restaurant,isLoading
    };
}

export const useSearchRestaurants=(searchState:SearchState ,city?:string)=>{
    const params=new URLSearchParams();
    params.set("searchQuery",searchState.searchQuery);
    params.set("page",searchState.page.toString());
    params.set("selectedCuisines",searchState.selectedCuisines.join(","));
    params.set("sortOption",searchState.sortOption);
    const createSearchRequest= async():Promise<RestaurantSearchResponse>=>{
        const response=await fetch(`${API_BASE_URL}/api/restaurant/search/${city}?${params.toString()}`
        );


        if(!response.ok){
            throw new Error("Failed to get restaurant");
        }

        return response.json();
    };
    const {data:results,isLoading}=useQuery(
        ["searchRestaurants",city,searchState],
        createSearchRequest,
        {enabled:!!city},
    );

    return {
        isLoading,
        results,
    }
};

// Distinct cities that currently have restaurants (for the homepage selector).
export const useGetCities = () => {
    const request = async (): Promise<string[]> => {
        const response = await fetch(`${API_BASE_URL}/api/restaurant/cities`);
        if (!response.ok) throw new Error("Failed to get cities");
        return response.json();
    };
    const { data: cities } = useQuery("fetchCities", request);
    return { cities };
};

export type Bestseller = {
    name: string;
    price: number;
    imageUrl?: string;
    restaurantId: string;
    restaurantName: string;
};

// Bestseller dishes in a given city (for the homepage row).
export const useGetBestsellers = (city?: string) => {
    const request = async (): Promise<Bestseller[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/restaurant/bestsellers/${city}`
        );
        if (!response.ok) throw new Error("Failed to get bestsellers");
        return response.json();
    };
    const { data: bestsellers } = useQuery(["bestsellers", city], request, {
        enabled: !!city,
    });
    return { bestsellers };
};