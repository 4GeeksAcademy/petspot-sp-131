import React from "react";
import { Link } from "react-router-dom";

export default function AdminPageHeader({ title, breadcrumbs, actions }) {
  return (
    <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
      <div>
        <h1
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--admin-text)",
            marginBottom: breadcrumbs?.length ? 6 : 0,
          }}
        >
          {title}
        </h1>
        {breadcrumbs?.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol className="d-flex align-items-center gap-1 list-unstyled mb-0">
              {breadcrumbs.map((crumb, i) => (
                <li
                  key={i}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: "0.8rem" }}
                >
                  {i > 0 && (
                    <i
                      className="fa-solid fa-chevron-right"
                      aria-hidden="true"
                      style={{ fontSize: "0.6rem", color: "var(--admin-text-muted)" }}
                    />
                  )}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      style={{ color: "var(--admin-primary)", textDecoration: "none" }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--admin-text-muted)" }}>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      {actions && <div className="d-flex align-items-center gap-2">{actions}</div>}
    </div>
  );
}
