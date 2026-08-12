import type { UserRole } from "../../features/auth/types/user.types";
import { useMe } from "../../features/auth/hooks/useMe";
import { Navigate } from "react-router-dom";
import { LoaderSpinner } from "../ui/LoaderSpinner";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleRout = ({ children, allowedRoles }: RoleRouteProps) => {
  const { data: user, isPending } = useMe();

  if (isPending) {
    return <LoaderSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRout;
