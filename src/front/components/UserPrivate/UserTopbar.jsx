import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function UserTopbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const userName = store?.user?.name || localStorage.getItem("userName") || "Usuario";

  function handleLogout() {
    localStorage.removeItem("userToken");
    dispatch({ type: "USER_LOGOUT" });
    navigate("/", { replace: true });
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

      <Link to="/user/private" className="pvt-topbar__logo-area">
        <i className="fa-solid fa-paw pvt-topbar__logo-icon" aria-hidden="true" />
        <span className="pvt-topbar__logo-text">PetSpot</span>
      </Link>

      <div className="pvt-topbar__right">
        <span className="pvt-topbar__name">
          <i className="fa-regular fa-circle-user" aria-hidden="true" />
          {userName}
        </span>
        <button className="pvt-topbar__logout" onClick={handleLogout} aria-label="Logout">
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          Salir
        </button>
      </div>
    </header>
  );
}
