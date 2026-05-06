import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

const PALETTE = ["#c97b63", "#8b4a3a", "#7ba05b", "#d4a574", "#b85450", "#6b8cba", "#a87cb8"];

const BAR_RADIUS = [6, 6, 0, 0];

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #ead8cc", borderRadius: 8,
      padding: "8px 14px", fontSize: "0.82rem", color: "#3d2b25",
      boxShadow: "0 2px 8px rgba(61,43,37,0.10)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div>{payload[0].value} <span style={{ color: "#8a7065" }}>registros</span></div>
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: "#fff", border: "1px solid #ead8cc", borderRadius: 8,
      padding: "8px 14px", fontSize: "0.82rem", color: "#3d2b25",
      boxShadow: "0 2px 8px rgba(61,43,37,0.10)",
    }}>
      <span style={{ fontWeight: 700 }}>{name}</span>: {value}
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "center", marginTop: 8 }}>
      {payload.map((entry, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#3d2b25" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color, display: "inline-block" }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

export default function AdminCharts({ data, loading }) {
  const [view, setView] = useState("bar");

  const chartData = [
    { label: "Usuarios",     value: data.users ?? 0 },
    { label: "Lugares",      value: data.places ?? 0 },
    { label: "Ciudades",     value: data.cities ?? 0 },
    { label: "Noticias",     value: data.news ?? 0 },
    { label: "Reservas",     value: data.reservations ?? 0 },
    { label: "Reseñas",      value: data.reviews ?? 0 },
  ];

  const reservationPieData = [
    { name: "Pendientes",   value: data.pending ?? 0 },
    { name: "Confirmadas",  value: (data.reservations ?? 0) - (data.pending ?? 0) - (data.cancelled ?? 0) },
    { name: "Canceladas",   value: data.cancelled ?? 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="admin-card mb-4">
      {/* Header with toggle */}
      <div className="admin-card__header" style={{ alignItems: "center" }}>
        <span className="admin-card__title">
          <i className="fa-solid fa-chart-bar me-2" style={{ color: "var(--admin-primary)" }} aria-hidden="true" />
          Estadísticas generales
        </span>
        <div style={{
          display: "flex", gap: 4,
          background: "var(--admin-surface-alt)", borderRadius: 8, padding: 3,
        }}>
          {[
            { key: "bar",  icon: "fa-chart-bar",    label: "Barras" },
            { key: "donut", icon: "fa-circle-dot",  label: "Donut"  },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              title={label}
              style={{
                border: "none", cursor: "pointer",
                borderRadius: 6, padding: "5px 12px",
                fontSize: "0.78rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 160ms ease",
                background: view === key ? "#fff" : "transparent",
                color: view === key ? "var(--admin-primary)" : "var(--admin-text-muted)",
                boxShadow: view === key ? "0 1px 3px rgba(61,43,37,0.10)" : "none",
              }}
            >
              <i className={`fa-solid ${icon}`} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-center admin-text-muted" style={{ fontSize: "0.85rem" }}>
          <i className="fa-solid fa-spinner fa-spin me-2" aria-hidden="true" />Cargando gráficas…
        </div>
      ) : (
        <div>
          {view === "bar" && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#ead8cc" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8a7065" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8a7065" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(201,123,99,0.06)" }} />
                <Bar dataKey="value" radius={BAR_RADIUS} maxBarSize={52}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {view === "donut" && (
            <div className="row g-3 align-items-center">
              {/* Overview donut */}
              <div className="col-12 col-md-6">
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--admin-text-muted)", textAlign: "center", margin: "0 0 4px" }}>
                  VISIÓN GLOBAL
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%" cy="50%"
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={3}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Reservations status donut */}
              <div className="col-12 col-md-6">
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--admin-text-muted)", textAlign: "center", margin: "0 0 4px" }}>
                  ESTADO DE RESERVAS
                </p>
                {reservationPieData.length === 0 ? (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>
                    Sin datos de reservas
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={reservationPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius="52%"
                        outerRadius="78%"
                        paddingAngle={3}
                      >
                        {reservationPieData.map((_, i) => (
                          <Cell key={i} fill={["#d4a574", "#7ba05b", "#b85450"][i % 3]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
