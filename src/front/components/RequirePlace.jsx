import React from "react";
import { Navigate } from "react-router-dom";

const RequirePlace = ({ children }) => {
  const isPlace = localStorage.getItem("token_place");

  if (!isPlace) {
    return <Navigate to="/places/login" />;
  }

  return children;
};

export default RequirePlace;
