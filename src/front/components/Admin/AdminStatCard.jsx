import React from "react";

export default function AdminStatCard({ icon, label, value, trend, variant = "primary" }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-card__icon-wrap admin-stat-card__icon-wrap--${variant === "primary" ? "" : variant}`}
        style={variant === "primary" ? {} : undefined}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </div>
      <div className="admin-stat-card__info">
        <div className="admin-stat-card__label">{label}</div>
        <div className="admin-stat-card__value">{value}</div>
        {trend && <div className="admin-stat-card__trend">{trend}</div>}
      </div>
    </div>
  );
}
