import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function PendingReservationsWidget() {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    const token = localStorage.getItem("tokenAdmin");
    fetch(`${BACKEND}/api/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((all) => {
        const pending = all
          .filter((r) => r.status === "pending")
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setState({ loading: false, error: null, data: pending });
      })
      .catch(() => setState({ loading: false, error: "Couldn't load", data: [] }));
  }, []);

  const count = state.loading ? "…" : state.error ? "!" : state.data.length;

  return (
    <div className="admin-widget">
      <button
        className="admin-widget__header w-100 border-0 bg-transparent"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label="Toggle pending reservations widget"
      >
        <span className="admin-widget__title">
          <i className="fa-regular fa-clock me-1" aria-hidden="true" style={{ color: "var(--admin-warning)" }} />
          Pending reservations ({count})
        </span>
        <i
          className={`fa-solid fa-chevron-down admin-widget__chevron ${expanded ? "admin-widget__chevron--open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="admin-widget__body">
          {state.loading && (
            <div className="admin-widget__state">
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
              <span>Loading…</span>
            </div>
          )}
          {state.error && (
            <div className="admin-widget__state">
              <span>{state.error}</span>
            </div>
          )}
          {!state.loading && !state.error && state.data.length === 0 && (
            <div className="admin-widget__state">No pending reservations</div>
          )}
          {state.data.slice(0, 5).map((r) => (
            <Link
              key={r.id}
              to={`/reservations/view/${r.id}`}
              className="admin-widget-item"
            >
              <div className="admin-widget-item__main">
                <div className="admin-widget-item__title">
                  {r.place_name || "–"} · {r.user_name || "–"}
                </div>
                <div className="admin-widget-item__sub">
                  {r.date ? new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "–"}
                </div>
              </div>
              <i className="fa-solid fa-chevron-right admin-widget-item__meta" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
