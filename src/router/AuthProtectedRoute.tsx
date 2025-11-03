import { Outlet } from "react-router-dom";
import NotFoundPage from "../pages/404Page";
import { useSession } from "../context/SessionContext";

const AuthProtectedRoute = () => {
  const { session } = useSession();
  if (!session) {
    return <NotFoundPage />;
  }
  return <Outlet />;
};

export default AuthProtectedRoute;