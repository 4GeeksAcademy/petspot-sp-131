import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminStatCard from "../components/Admin/AdminStatCard";
import AdminBadge from "../components/Admin/AdminBadge";
import AdminPageHeader from "../components/Admin/AdminPageHeader";
import AdminCharts from "../components/Admin/AdminCharts";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("tokenAdmin")}` };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(val) {
  if (!val) return "–";
  return new Date(val).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function truncate(str, n = 38) {
  if (!str) return "–";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function reservationVariant(status) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "pending";
  if (s === "confirmed") return "confirmed";
  if (s === "cancelled") return "cancelled";
  return "neutral";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: null, places: null, cities: null, news: null,
    reservations: null, pending: null, cancelled: null, confirmedToday: null,
    reviews: null, unreadChats: null,
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    const today = todayStr();

    Promise.all([
      fetch(`${BACKEND}/api/users`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BACKEND}/api/places`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BACKEND}/api/cities`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BACKEND}/api/news`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BACKEND}/api/reservations`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BACKEND}/api/reviews`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BACKEND}/api/chat`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([users, places, cities, news, reservations, reviews, chats]) => {
      const pending = reservations.filter(r =>
        (r.status || "").toLowerCase() === "pending"
      );
      const cancelled = reservations.filter(r =>
        (r.status || "").toLowerCase() === "cancelled"
      );
      const confirmedToday = reservations.filter(r =>
        (r.status || "").toLowerCase() === "confirmed" &&
        (r.reservation_date || r.date || "").startsWith(today)
      );
      const unread = chats.filter(c => c.is_read === false);

      const sorted = [...reservations].sort((a, b) => {
        const da = a.reservation_date || a.date || "";
        const db = b.reservation_date || b.date || "";
        return db.localeCompare(da);
      });

      setStats({
        users: users.length,
        places: places.length,
        cities: cities.length,
        news: Array.isArray(news) ? news.length : (news?.results?.length ?? 0),
        reservations: reservations.length,
        pending: pending.length,
        cancelled: cancelled.length,
        confirmedToday: confirmedToday.length,
        reviews: Array.isArray(reviews) ? reviews.length : 0,
        unreadChats: unread.length,
      });

      setRecentReservations(sorted.slice(0, 6));
      setRecentChats(unread.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const adminName = localStorage.getItem("adminName") || "Admin";

  return (
    <div>
      {/* Welcome banner */}
      <div
        className="admin-card mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
        style={{
          background: "linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-accent) 100%)",
          border: "none",
          color: "#fff",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: 4, color: "#fff" }}>
            Buenos días, {adminName} 👋
          </h2>
          <p style={{ fontSize: "0.875rem", opacity: 0.88, margin: 0 }}>
            Aquí tienes un resumen del estado actual de PetSpot.
          </p>
        </div>
        <div style={{ fontSize: "2.5rem", opacity: 0.25 }}>
          <i className="fa-solid fa-paw" aria-hidden="true" />
        </div>
      </div>

      {/* Stat cards — row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-users" label="Usuarios registrados" value={loading ? "…" : stats.users} variant="primary" />
        </div>
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-store" label="Establecimientos" value={loading ? "…" : stats.places} variant="success" />
        </div>
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-city" label="Ciudades" value={loading ? "…" : stats.cities} variant="warning" />
        </div>
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-newspaper" label="Noticias publicadas" value={loading ? "…" : stats.news} variant="primary" />
        </div>
      </div>

      {/* Stat cards — row 2 */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-calendar-days" label="Reservas totales" value={loading ? "…" : stats.reservations} variant="primary" />
        </div>
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-clock" label="Reservas pendientes" value={loading ? "…" : stats.pending} variant="warning" trend="Requieren atención" />
        </div>
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-star" label="Reseñas" value={loading ? "…" : stats.reviews} variant="success" />
        </div>
        <div className="col-6 col-md-3">
          <AdminStatCard icon="fa-comments" label="Chats sin leer" value={loading ? "…" : stats.unreadChats} variant="danger" trend={stats.unreadChats > 0 ? "Pendientes de respuesta" : undefined} />
        </div>
      </div>

      {/* Charts */}
      <AdminCharts data={stats} loading={loading} />

      {/* Bottom two columns */}
      <div className="row g-3">
        {/* Recent reservations */}
        <div className="col-12 col-lg-7">
          <div className="admin-card h-100">
            <div className="admin-card__header">
              <span className="admin-card__title">
                <i className="fa-solid fa-calendar-check me-2" style={{ color: "var(--admin-primary)" }} aria-hidden="true" />
                Reservas recientes
              </span>
              <Link to="/reservations" className="admin-btn admin-btn-ghost admin-btn--sm">
                Ver todas <i className="fa-solid fa-arrow-right ms-1" aria-hidden="true" />
              </Link>
            </div>
            {loading ? (
              <div className="py-4 text-center admin-text-muted" style={{ fontSize: "0.85rem" }}>
                <i className="fa-solid fa-spinner fa-spin me-2" aria-hidden="true" />Cargando…
              </div>
            ) : recentReservations.length === 0 ? (
              <div className="py-4 text-center admin-text-muted" style={{ fontSize: "0.85rem" }}>No hay reservas aún</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Lugar</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.place_name || `Place #${r.place_id}`}</td>
                        <td style={{ color: "var(--admin-text-muted)" }}>{r.user_name || `User #${r.user_id}`}</td>
                        <td style={{ color: "var(--admin-text-muted)", whiteSpace: "nowrap" }}>
                          {fmtDate(r.reservation_date || r.date)}
                        </td>
                        <td>
                          <AdminBadge variant={reservationVariant(r.status)}>
                            {r.status || "–"}
                          </AdminBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Unread chats + quick actions */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-3">
          {/* Unread chats */}
          <div className="admin-card flex-grow-1">
            <div className="admin-card__header">
              <span className="admin-card__title">
                <i className="fa-solid fa-comment-dots me-2" style={{ color: "var(--admin-primary)" }} aria-hidden="true" />
                Chats sin leer
              </span>
              <Link to="/usuario/admin/community" className="admin-btn admin-btn-ghost admin-btn--sm">
                Ver todos <i className="fa-solid fa-arrow-right ms-1" aria-hidden="true" />
              </Link>
            </div>
            {loading ? (
              <div className="py-3 text-center admin-text-muted" style={{ fontSize: "0.85rem" }}>
                <i className="fa-solid fa-spinner fa-spin me-2" aria-hidden="true" />Cargando…
              </div>
            ) : recentChats.length === 0 ? (
              <div className="py-3 d-flex align-items-center gap-2" style={{ fontSize: "0.85rem", color: "var(--admin-success)" }}>
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                No hay chats sin leer
              </div>
            ) : (
              <div>
                {recentChats.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom: "1px solid var(--admin-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        backgroundColor: "var(--admin-primary-soft)",
                        color: "var(--admin-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8rem", flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-user" aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--admin-text)" }}>
                        {c.user_name || "Usuario"} → {c.place_name || "Lugar"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 1 }}>
                        {truncate(c.message || c.last_message)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="admin-card">
            <div className="admin-card__header">
              <span className="admin-card__title">
                <i className="fa-solid fa-bolt me-2" style={{ color: "var(--admin-primary)" }} aria-hidden="true" />
                Acciones rápidas
              </span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {[
                { label: "Nueva ciudad", to: "/cities/add", icon: "fa-plus" },
                { label: "Nuevo lugar", to: "/places/add", icon: "fa-plus" },
                { label: "Nueva noticia", to: "/news/add", icon: "fa-plus" },
                { label: "Ver reservas", to: "/reservations", icon: "fa-calendar-days" },
                { label: "Ver usuarios", to: "/user", icon: "fa-users" },
                { label: "Ver reseñas", to: "/reviews", icon: "fa-star" },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="admin-btn admin-btn-outline admin-btn--sm">
                  <i className={`fa-solid ${a.icon}`} aria-hidden="true" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
