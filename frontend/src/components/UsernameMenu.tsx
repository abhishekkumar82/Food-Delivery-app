import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import {  CircleUserRound } from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

const UsernameMenu = () => {
const {user,logout}=useAuth0();

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
        <DropdownMenuItem>
        <Link
        to="/analytics"
        className='font-bold hover:text-orange-500'
        >
           Analytics
        </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
        <Link
        to="/manage-surprise-bags"
        className='font-bold hover:text-orange-500'
        >
           Manage Surprise Bags
        </Link>
        </DropdownMenuItem>
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
        to="/surprise-bags"
        className='font-bold hover:text-orange-500'
        >
            Surprise Bags
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
