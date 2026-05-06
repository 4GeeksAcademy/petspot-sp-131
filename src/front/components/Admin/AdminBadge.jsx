import React from "react";

export default function AdminBadge({ variant = "neutral", children }) {
  return (
    <span className={`admin-badge admin-badge--${variant}`}>
      {children}
    </span>
  );
}
