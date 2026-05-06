import React from "react";

export default function AdminEmptyState({ icon = "fa-inbox", title, message, action }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 px-3 text-center">
      <div
        className="mb-3 d-flex align-items-center justify-content-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: "var(--admin-radius)",
          backgroundColor: "var(--admin-primary-soft)",
          color: "var(--admin-primary)",
          fontSize: "1.75rem",
        }}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </div>
      <p className="mb-1 admin-fw-semibold" style={{ color: "var(--admin-text)" }}>
        {title}
      </p>
      {message && (
        <p className="mb-3" style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
          {message}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
