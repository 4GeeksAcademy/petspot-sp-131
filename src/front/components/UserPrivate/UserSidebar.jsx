import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const NAV_SECTIONS = [
  {
    label: "Navegación",
    items: [
      { icon: "fa-house",          label: "Inicio",          to: "/user/private",                    end: true },
      { icon: "fa-magnifying-glass",label: "Place Matcher",  to: "/user/private/place-matcher" },
    ],
  },
  {
    label: "Mi cuenta",
    items: [
      { icon: "fa-circle-user",    label: "Perfil",          to: "/user/private/profile"       },
      { icon: "fa-paw",            label: "Mis mascotas",    to: "/user/private/pets"          },
    ],
  },
  {
    label: "Actividad",
    items: [
      { icon: "fa-heart",          label: "Favoritos",       to: "/user/private/favorites"     },
      { icon: "fa-calendar-days",  label: "Reservas",        to: "/user/private/reservations"  },
      { icon: "fa-star",           label: "Reseñas",         to: "/user/private/reviews"       },
      { icon: "fa-newspaper",      label: "Noticias",        to: "/user/private/news"          },
      { icon: "fa-comments",       label: "Chats",           to: "/user/private/chats"         },
    ],
  },
];

export default function UserSidebar({ onClose }) {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const userName = store?.user?.name || localStorage.getItem("userName") || "Usuario";

  function handleLogout() {
    localStorage.removeItem("userToken");
    dispatch({ type: "USER_LOGOUT" });
    navigate("/", { replace: true });
  }

  return (
    <nav className="pvt-sidebar" aria-label="User navigation">
      <Link to="/user/private" className="pvt-sidebar__logo" onClick={onClose}>
        <i className="fa-solid fa-paw pvt-sidebar__logo-icon" aria-hidden="true" />
        <span className="pvt-sidebar__logo-text">Mi PetSpot</span>
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

      <div className="pvt-sidebar__section" style={{ marginTop: 4 }}>
        <Link
          to="/tell-me-more"
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: "var(--admin-radius-sm)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "#fff",
            marginBottom: 2,
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles pvt-sidebar-item__icon" aria-hidden="true" style={{ color: "#fff" }} />
          ✨ Tell me more
        </Link>
      </div>

      <div className="pvt-sidebar__footer">
        <div className="pvt-sidebar__profile">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pvt-sidebar__profile-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </div>
            <div className="pvt-sidebar__profile-role">Usuario</div>
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
