import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const NAV_SECTIONS = [
  {
    label: "Mi espacio",
    items: [
      { icon: "fa-house",         label: "Inicio",          to: "/places/private",           end: true },
      { icon: "fa-table-cells",   label: "Panel de reservas", to: "/places/private/dashboard" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { icon: "fa-comments",      label: "Chats",           to: "/places/private/chats"  },
      { icon: "fa-pen-to-square", label: "Editar perfil",   to: "/places/private/edit"   },
    ],
  },
];

export default function PlaceSidebar({ onClose }) {
  const navigate = useNavigate();
  const placeName = localStorage.getItem("place_name") || "Mi Local";

  function handleLogout() {
    localStorage.removeItem("token_place");
    localStorage.removeItem("place_name");
    navigate("/places/login");
  }

  return (
    <nav className="pvt-sidebar" aria-label="Place navigation">
      <Link to="/places/private" className="pvt-sidebar__logo" onClick={onClose}>
        <i className="fa-solid fa-store pvt-sidebar__logo-icon" aria-hidden="true" />
        <span className="pvt-sidebar__logo-text">Portal del Local</span>
      </Link>

      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="pvt-sidebar__section">
          <div className="pvt-sidebar__section-label">{section.label}</div>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `pvt-sidebar-item${isActive ? " pvt-sidebar-item--active" : ""}`
              }
              onClick={onClose}
            >
              <i className={`fa-solid ${item.icon} pvt-sidebar-item__icon`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="pvt-sidebar__footer">
        <div className="pvt-sidebar__profile">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pvt-sidebar__profile-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {placeName}
            </div>
            <div className="pvt-sidebar__profile-role">Establecimiento</div>
          </div>
          <button
            className="pvt-sidebar__logout-btn"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
