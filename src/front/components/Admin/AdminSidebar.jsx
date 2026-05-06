import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import AlertsWidget from "./widgets/AlertsWidget";
import PendingReservationsWidget from "./widgets/PendingReservationsWidget";
import RecentChatsWidget from "./widgets/RecentChatsWidget";

const NAV_SECTIONS = [
  {
    label: "Navegación",
    items: [
      { icon: "fa-house", label: "Dashboard", to: "/usuario/admin" },
    ],
  },
  {
    label: "Contenido",
    items: [
      { icon: "fa-store", label: "Places", to: "/places" },
      { icon: "fa-city", label: "Cities", to: "/cities" },
      { icon: "fa-newspaper", label: "News", to: "/news" },
      { icon: "fa-paw", label: "Pets", to: "/usuario/admin/pets" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { icon: "fa-calendar-days", label: "Reservations", to: "/reservations" },
      { icon: "fa-star", label: "Reviews", to: "/reviews" },
      { icon: "fa-comments", label: "Community Chat", to: "/usuario/admin/community" },
      { icon: "fa-heart", label: "Favorites", to: "/favorites" },
    ],
  },
  {
    label: "Usuarios",
    items: [
      { icon: "fa-users", label: "Users", to: "/user" },
      { icon: "fa-shield-halved", label: "Admins", to: "/usuario/admin" },
    ],
  },
];

const SHORTCUTS = [
  { label: "New city", to: "/cities/add" },
  { label: "New place", to: "/places/add" },
  { label: "New news", to: "/news/add" },
];

export default function AdminSidebar({ onClose }) {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  function handleLogout() {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("adminName");
    navigate("/usuario/admin/login");
  }

  function handleLinkClick() {
    if (onClose) onClose();
  }

  return (
    <nav className="admin-sidebar" aria-label="Admin navigation">
      <Link to="/usuario/admin" className="admin-sidebar__logo" onClick={handleLinkClick}>
        <i className="fa-solid fa-paw admin-sidebar__logo-icon" aria-hidden="true" />
        <span className="admin-sidebar__logo-text">PetSpot Admin</span>
      </Link>

      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="admin-sidebar__section">
          <div className="admin-sidebar__section-label">{section.label}</div>
          {section.items.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === "/usuario/admin"}
              className={({ isActive }) =>
                `admin-sidebar-item${isActive ? " admin-sidebar-item--active" : ""}`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              onClick={handleLinkClick}
            >
              <i className={`fa-solid ${item.icon} admin-sidebar-item__icon`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="admin-sidebar__section">
        <div className="admin-sidebar__section-label">Atajos rápidos</div>
        {SHORTCUTS.map((s) => (
          <Link key={s.to} to={s.to} className="admin-sidebar-shortcut" onClick={handleLinkClick}>
            <i className="fa-solid fa-plus" aria-hidden="true" style={{ fontSize: "0.7rem" }} />
            {s.label}
          </Link>
        ))}
      </div>

      <div className="admin-sidebar__section">
        <div className="admin-sidebar__section-label">Dashboard widgets</div>
        <AlertsWidget />
        <PendingReservationsWidget />
        <RecentChatsWidget />
      </div>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__profile">
          <div>
            <div className="admin-sidebar__profile-name">{adminName}</div>
            <div className="admin-sidebar__profile-role">Administrator</div>
          </div>
          <button
            className="admin-sidebar__logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
