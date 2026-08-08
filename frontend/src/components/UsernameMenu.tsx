import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { CircleUserRound } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useGetMyRestaurant } from '@/api/MyRestaurantApi';

const itemClass = 'font-bold hover:text-orange-500';

const UsernameMenu = () => {
  const { user, logout } = useAuth0();
  // owner-only links appear only when this account actually owns a restaurant
  const { restaurant } = useGetMyRestaurant();
  const isOwner = !!restaurant;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center px-3 font-bold hover:text-orange-500 gap-2 ">
        <CircleUserRound className="text-orange-500" />
        {user?.email}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xs text-gray-400">My Account</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link to="/user-profile" className={itemClass}>User Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/address-book" className={itemClass}>My Addresses</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/wallet" className={itemClass}>Wallet &amp; Rewards</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/favorites" className={itemClass}>My Favorites</Link>
        </DropdownMenuItem>

        <Separator />
        <DropdownMenuLabel className="text-xs text-gray-400">Discover</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link to="/recommendations" className={itemClass}>✨ For You</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/ai-search" className={itemClass}>✨ AI Search</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/surprise-bags" className={itemClass}>Surprise Bags</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/membership" className={itemClass}>Membership</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/rewards" className={itemClass}>Rewards</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/my-impact" className={itemClass}>My Green Impact</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/join-group" className={itemClass}>Join Group Order</Link>
        </DropdownMenuItem>

        <Separator />
        <DropdownMenuLabel className="text-xs text-gray-400">Restaurant</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link to="/manage-restaurant" className={itemClass}>Manage Restaurant</Link>
        </DropdownMenuItem>
        {isOwner && (
          <DropdownMenuItem>
            <Link to="/analytics" className={itemClass}>Analytics</Link>
          </DropdownMenuItem>
        )}
        {isOwner && (
          <DropdownMenuItem>
            <Link to="/manage-surprise-bags" className={itemClass}>Manage Surprise Bags</Link>
          </DropdownMenuItem>
        )}

        <Separator />
        <DropdownMenuItem>
          <Button onClick={() => logout()} className="flex flex-1 font-bold bg-orange-500">
            Log Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsernameMenu;
