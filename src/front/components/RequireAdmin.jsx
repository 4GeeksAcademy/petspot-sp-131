import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const isAdmin = localStorage.getItem("tokenAdmin");
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/usuario/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default RequireAdmin;