import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { useRole } from "@/api/MyUserApi";

const linkClass =
  "flex bg-white items-center font-bold hover:text-orange-500";

const MobileNavLinks = () => {
  const { logout } = useAuth0();
  const { isOwner, isAdmin, role } = useRole();

  return (
    <>
      <Link to="/order-status" className={linkClass}>
        Order Status
      </Link>
      <Link to="/user-profile" className={linkClass}>
        User Profile
      </Link>
      <Link to="/address-book" className={linkClass}>
        My Addresses
      </Link>
      <Link to="/favorites" className={linkClass}>
        My Favorites
      </Link>
      <Link to="/wallet" className={linkClass}>
        Wallet &amp; Rewards
      </Link>
      <Link to="/rewards" className={linkClass}>
        Rewards
      </Link>
      <Link to="/recommendations" className={linkClass}>
        ✨ For You
      </Link>
      <Link to="/ai-search" className={linkClass}>
        ✨ AI Search
      </Link>
      <Link to="/surprise-bags" className={linkClass}>
        Surprise Bags
      </Link>
      {role === "customer" && (
        <Link to="/partner" className={linkClass}>
          🏪 Become a Partner
        </Link>
      )}
      {isOwner && (
        <>
          <Link to="/manage-restaurant" className={linkClass}>
            Manage Restaurant
          </Link>
          <Link to="/analytics" className={linkClass}>
            Analytics
          </Link>
          <Link to="/manage-surprise-bags" className={linkClass}>
            Manage Surprise Bags
          </Link>
        </>
      )}
      {isAdmin && (
        <Link to="/admin" className={linkClass}>
          🛡️ Admin Dashboard
        </Link>
      )}
      <Button
        onClick={() => logout()}
        className="flex items-center px-3 font-bold hover:bg-gray-500"
      >
        Log Out
      </Button>
    </>
  );
};

export default MobileNavLinks;
