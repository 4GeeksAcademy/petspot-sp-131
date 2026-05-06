import React, { useState, useCallback } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function AlertsWidget() {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ loading: false, error: null, alerts: null });

  const loadAlerts = useCallback(async () => {
    setState({ loading: true, error: null, alerts: null });
    const token = localStorage.getItem("tokenAdmin");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(`${BACKEND}/api/places`, { headers });
      if (!res.ok) throw new Error(`${res.status}`);
      const places = await res.json();

      const results = await Promise.all(
        places.map(async (place) => {
          const [schedRes, tablesRes] = await Promise.all([
            fetch(`${BACKEND}/api/places/${place.id}/schedule`, { headers }),
            fetch(`${BACKEND}/api/places/${place.id}/tables`, { headers }),
          ]);
          const schedule = schedRes.ok ? await schedRes.json() : [];
          const tables = tablesRes.ok ? await tablesRes.json() : [];
          const issues = [];
          if (!Array.isArray(schedule) || schedule.length === 0)
            issues.push(`"${place.name}" is missing a schedule`);
          if (!Array.isArray(tables) || tables.length === 0)
            issues.push(`"${place.name}" has no tables`);
          return issues;
        })
      );

      setState({ loading: false, error: null, alerts: results.flat() });
    } catch {
      setState({ loading: false, error: "Couldn't load", alerts: null });
    }
  }, []);

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && state.alerts === null && !state.loading) {
      loadAlerts();
    }
  }

  const count = state.alerts ? state.alerts.length : "–";

  return (
    <div className="admin-widget">
      <button
        className="admin-widget__header w-100 border-0 bg-transparent"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-label="Toggle alerts widget"
      >
        <span className="admin-widget__title">
          <i className="fa-solid fa-triangle-exclamation me-1" aria-hidden="true" style={{ color: "var(--admin-warning)" }} />
          Alerts ({count})
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
              <button className="admin-widget__retry" onClick={loadAlerts} aria-label="Retry loading alerts">
                Retry
              </button>
            </div>
          )}
          {state.alerts && state.alerts.length === 0 && (
            <div className="admin-widget__state">
              <i className="fa-solid fa-circle-check me-1" style={{ color: "var(--admin-success)" }} aria-hidden="true" />
              All places look good
            </div>
          )}
          {state.alerts && state.alerts.map((alert, i) => (
            <div key={i} className="admin-widget-item">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" style={{ color: "var(--admin-warning)", flexShrink: 0, marginTop: 1 }} />
              <span className="admin-widget-item__title">{alert}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
