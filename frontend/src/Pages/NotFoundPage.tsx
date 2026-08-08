import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-7xl font-bold text-orange-500">404</h1>
      <h2 className="text-2xl font-bold">Page not found</h2>
      <p className="text-gray-500">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/">
        <Button className="mt-2 bg-orange-500">Back to home</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
