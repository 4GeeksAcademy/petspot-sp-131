import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PlaceTopbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const placeName = localStorage.getItem("place_name") || "Mi Local";

  function handleLogout() {
    localStorage.removeItem("token_place");
    localStorage.removeItem("place_name");
    navigate("/places/login");
  }

  return (
    <header className="pvt-topbar">
      <button
        className="pvt-topbar__hamburger"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>

      <Link to="/places/private" className="pvt-topbar__logo-area">
        <i className="fa-solid fa-store pvt-topbar__logo-icon" aria-hidden="true" />
        <span className="pvt-topbar__logo-text">PetSpot</span>
      </Link>

      <div className="pvt-topbar__right">
        <span className="pvt-topbar__name">
          <i className="fa-regular fa-circle-user" aria-hidden="true" />
          {placeName}
        </span>
        <button className="pvt-topbar__logout" onClick={handleLogout} aria-label="Logout">
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          Salir
        </button>
      </div>
    </header>
  );
}
