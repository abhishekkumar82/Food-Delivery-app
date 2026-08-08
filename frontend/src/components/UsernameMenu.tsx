import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import {  CircleUserRound } from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useGetMyRestaurant } from '@/api/MyRestaurantApi';

const UsernameMenu = () => {
const {user,logout}=useAuth0();
// owner-only links appear only when this account actually owns a restaurant
const {restaurant}=useGetMyRestaurant();
const isOwner=!!restaurant;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center px-3 font-bold hover:text-orange-500 gap-2 " >
       <CircleUserRound className='text-orange-500'/>
          {user ?.email}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
      <DropdownMenuItem>
        <Link
        to="/manage-restaurant"
        className='font-bold hover:text-orange-500'
        >
           Manage Restaurant
        </Link>
        </DropdownMenuItem>
        {isOwner && (
        <DropdownMenuItem>
        <Link
        to="/analytics"
        className='font-bold hover:text-orange-500'
        >
           Analytics
        </Link>
        </DropdownMenuItem>
        )}
        {isOwner && (
        <DropdownMenuItem>
        <Link
        to="/manage-surprise-bags"
        className='font-bold hover:text-orange-500'
        >
           Manage Surprise Bags
        </Link>
        </DropdownMenuItem>
        )}
        <DropdownMenuItem>
        <Link
        to="/user-profile"
        className='font-bold hover:text-orange-500'
        >
            User Profile
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/address-book"
        className='font-bold hover:text-orange-500'
        >
            My Addresses
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/membership"
        className='font-bold hover:text-orange-500'
        >
            Membership
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/rewards"
        className='font-bold hover:text-orange-500'
        >
            Rewards
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/recommendations"
        className='font-bold hover:text-orange-500'
        >
            ✨ For You
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/ai-search"
        className='font-bold hover:text-orange-500'
        >
            ✨ AI Search
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/my-impact"
        className='font-bold hover:text-orange-500'
        >
            My Green Impact
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/surprise-bags"
        className='font-bold hover:text-orange-500'
        >
            Surprise Bags
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/join-group"
        className='font-bold hover:text-orange-500'
        >
            Join Group Order
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/favorites"
        className='font-bold hover:text-orange-500'
        >
            My Favorites
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/wallet"
        className='font-bold hover:text-orange-500'
        >
            Wallet & Rewards
        </Link>
        </DropdownMenuItem>
        <Separator/>
        <DropdownMenuItem>
             <Button onClick={()=> logout()} className="flex flex-1 font-bold bg-orange-500">Log Out</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UsernameMenu
