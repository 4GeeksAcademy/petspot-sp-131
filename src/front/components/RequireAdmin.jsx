import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const isAdmin = localStorage.getItem("tokenAdmin");

  if (!isAdmin) {
    return <Navigate to="/usuario/admin/login" />;
  }

  return children;
};

export default RequireAdmin;