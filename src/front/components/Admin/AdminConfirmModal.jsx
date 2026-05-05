import React, { useEffect } from "react";

export default function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(61, 43, 37, 0.45)",
          zIndex: 2040,
        }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2050,
          background: "var(--admin-surface)",
          borderRadius: "var(--admin-radius-lg)",
          boxShadow: "var(--admin-shadow-lg)",
          width: "min(440px, 90vw)",
          padding: "28px",
        }}
      >
        <h2
          id="admin-modal-title"
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: danger ? "var(--admin-danger)" : "var(--admin-text)",
            marginBottom: 10,
          }}
        >
          {danger && (
            <i
              className="fa-solid fa-triangle-exclamation me-2"
              aria-hidden="true"
              style={{ color: "var(--admin-danger)" }}
            />
          )}
          {title}
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 24 }}>
          {message}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            className="admin-btn admin-btn-ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
