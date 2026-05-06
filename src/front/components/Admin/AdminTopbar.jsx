import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminTopbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  function handleLogout() {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("adminName");
    navigate("/usuario/admin/login");
  }

  return (
    <header className="admin-topbar">
      {onToggleSidebar && (
        <button
          className="admin-topbar__hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </button>
      )}

      <Link to="/usuario/admin" className="admin-topbar__logo-area">
        <i className="fa-solid fa-paw admin-topbar__logo-icon" aria-hidden="true" />
        <span className="admin-topbar__logo-text">PetSpot</span>
      </Link>

      <div className="admin-topbar__right">
        <span className="admin-topbar__admin-name">
          <i className="fa-regular fa-circle-user me-1" aria-hidden="true" />
          {adminName}
        </span>
        <button
          className="admin-topbar__logout"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  );
}
