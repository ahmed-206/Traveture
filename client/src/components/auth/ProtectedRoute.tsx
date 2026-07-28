import { useMe } from "../../features/auth/hooks/useMe";
import { Navigate } from "react-router-dom";

interface ProtectRouteProps {
  children: React.ReactNode;
}

const ProtectRoute = ({ children }: ProtectRouteProps) => {
  const { data: user, isPending} = useMe();

  if(isPending){
    return <p>Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectRoute;
