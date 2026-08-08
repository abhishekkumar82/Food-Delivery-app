import { useRole } from "@/api/MyUserApi";
import { Navigate, Outlet } from "react-router-dom";

// Guards admin-only pages. Sits INSIDE <ProtectedRoute> (already authenticated).
const AdminRoute = () => {
  const { isAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <span className="loader">
        <h1>Loading...</h1>
      </span>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
