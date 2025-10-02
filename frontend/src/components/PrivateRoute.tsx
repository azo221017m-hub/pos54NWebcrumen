import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  isLoggedIn: boolean;
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) return <Navigate to="/" />;
  return <>{children}</>;
};

export default PrivateRoute;
