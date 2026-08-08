import { useGetMyRestaurant } from "@/api/MyRestaurantApi";
import { Navigate, Outlet } from "react-router-dom";

// Guards owner-only pages (analytics, manage surprise bags). A logged-in user
// who does not own a restaurant is redirected to the create-restaurant page.
// This sits INSIDE <ProtectedRoute>, so the user is already authenticated here.
const OwnerRoute = () => {
  const { restaurant, isLoading } = useGetMyRestaurant();

  if (isLoading) {
    return (
      <span className="loader">
        <h1>Loading...</h1>
      </span>
    );
  }

  if (restaurant) {
    return <Outlet />;
  }

  return <Navigate to="/manage-restaurant" replace />;
};

export default OwnerRoute;
