import { useRole } from "@/api/MyUserApi";
import { Navigate, Outlet } from "react-router-dom";

// Guards owner-only pages (analytics, manage surprise bags). A logged-in user
// who is not an owner/admin is sent to the "Become a Partner" page.
// Sits INSIDE <ProtectedRoute>, so the user is already authenticated here.
const OwnerRoute = () => {
  const { isOwner, isLoading } = useRole();

  if (isLoading) {
    return (
      <span className="loader">
        <h1>Loading...</h1>
      </span>
    );
  }

  return isOwner ? <Outlet /> : <Navigate to="/partner" replace />;
};

export default OwnerRoute;
