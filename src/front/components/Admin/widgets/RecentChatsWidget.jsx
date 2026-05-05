import React, { useState, useEffect } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function RecentChatsWidget() {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    const token = localStorage.getItem("tokenAdmin");
    fetch(`${BACKEND}/api/chat`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((all) => {
        const unread = all.filter((c) => c.is_read === false);
        setState({ loading: false, error: null, data: unread });
      })
      .catch(() => setState({ loading: false, error: "Couldn't load", data: [] }));
  }, []);

  const count = state.loading ? "…" : state.error ? "!" : state.data.length;

  function preview(msg) {
    if (!msg) return "–";
    return msg.length > 40 ? msg.slice(0, 40) + "…" : msg;
  }

  return (
    <div className="admin-widget">
      <button
        className="admin-widget__header w-100 border-0 bg-transparent"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-label="Toggle recent chats widget"
      >
        <span className="admin-widget__title">
          <i className="fa-regular fa-comment me-1" aria-hidden="true" style={{ color: "var(--admin-primary)" }} />
          Unread chats ({count})
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
            <div className="admin-widget__state">No unread chats</div>
          )}
          {state.data.slice(0, 5).map((c) => (
            <div key={c.id} className="admin-widget-item">
              <div className="admin-widget-item__main">
                <div className="admin-widget-item__title">
                  {c.user_name || "User"} → {c.place_name || "Place"}
                </div>
                <div className="admin-widget-item__sub">{preview(c.message || c.last_message)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
