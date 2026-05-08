import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;
const backendUrl = rawBackendUrl
  ? rawBackendUrl.endsWith("/") ? rawBackendUrl.slice(0, -1) : rawBackendUrl
  : "";

// ─── Chair indicator SVG around the table ────────────────────────────────────
function ChairIndicators({ shape, w, h, people, pets }) {
  const total = Math.min(people + pets, 16);
  if (total === 0) return null;

  const chairs = [];
  const chairW = 10;
  const chairH = 7;
  const gap = 10;

  if (shape === "round" || shape === "oval") {
    const rx = w / 2 + gap + chairH / 2;
    const ry = (shape === "oval" ? h / 2 : w / 2) + gap + chairH / 2;
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < total; i++) {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = cx + rx * Math.cos(angle) - chairW / 2;
      const y = cy + ry * Math.sin(angle) - chairH / 2;
      const rot = (angle * 180) / Math.PI + 90;
      chairs.push({ x, y, rot });
    }
  } else {
    // Distribute along perimeter: top, right, bottom, left
    const topCount = Math.ceil(total * (w / (2 * (w + h))));
    const bottomCount = Math.floor(total * (w / (2 * (w + h))));
    const rightCount = Math.ceil((total - topCount - bottomCount) / 2);
    const leftCount = total - topCount - bottomCount - rightCount;

    const spacing = (side, count, isVertical) => {
      const sideLen = isVertical ? h : w;
      return count > 1 ? (sideLen - chairW) / (count - 1) : sideLen / 2;
    };

    // top
    for (let i = 0; i < topCount; i++) {
      const sp = spacing("top", topCount, false);
      const x = topCount > 1 ? i * sp : w / 2 - chairW / 2;
      chairs.push({ x, y: -(gap + chairH), rot: 0 });
    }
    // right
    for (let i = 0; i < rightCount; i++) {
      const sp = spacing("right", rightCount, true);
      const y = rightCount > 1 ? i * sp : h / 2 - chairW / 2;
      chairs.push({ x: w + gap, y, rot: 90 });
    }
    // bottom
    for (let i = 0; i < bottomCount; i++) {
      const sp = spacing("bottom", bottomCount, false);
      const x = bottomCount > 1 ? i * sp : w / 2 - chairW / 2;
      chairs.push({ x, y: h + gap, rot: 180 });
    }
    // left
    for (let i = 0; i < leftCount; i++) {
      const sp = spacing("left", leftCount, true);
      const y = leftCount > 1 ? i * sp : h / 2 - chairW / 2;
      chairs.push({ x: -(gap + chairH), y, rot: 270 });
    }
  }

  return (
    <>
      {chairs.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${c.x}px`,
            top: `${c.y}px`,
            width: `${chairW}px`,
            height: `${chairH}px`,
            background: "rgba(255,255,255,0.85)",
            borderRadius: "3px 3px 1px 1px",
            transform: `rotate(${c.rot}deg)`,
            transformOrigin: "center center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// ─── Table shape clip path helper ────────────────────────────────────────────
function getShapeStyle(shape, w, h) {
  switch (shape) {
    case "round":
      return { borderRadius: "50%" };
    case "oval":
      return { borderRadius: "50% / 40%" };
    case "rectangle":
      return { borderRadius: "10px" };
    case "diamond":
      return {
        borderRadius: "8px",
        transform: "rotate(45deg)",
        width: `${Math.min(w, h) * 0.85}px`,
        height: `${Math.min(w, h) * 0.85}px`,
      };
    default: // square
      return { borderRadius: "14px" };
  }
}

// ─── Individual table on the canvas ──────────────────────────────────────────
function TableFurniture({ table, reservations, onDelete, onEdit, onMove, editMode }) {
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-drop-${table.id}`,
    data: { type: "table", table },
  });

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `table-drag-${table.id}`,
    data: { type: "furniture", table },
    disabled: !editMode,
  });

  const w = table.width || 80;
  const h = table.height || 80;
  const isDiamond = table.shape === "diamond";
  const containerPad = 22; // room for chairs

  const hasReservations = reservations.length > 0;
  const isOccupied = table.is_occupied;

  /* Salmon tones: light=available  medium=reserved  dark=occupied */
  let accent = isOccupied
    ? { bg: "#8b4a3a", border: "rgba(139,74,58,0.55)", glow: "rgba(139,74,58,0.35)", text: "#fff" }
    : hasReservations
    ? { bg: "#c97b63", border: "rgba(201,123,99,0.55)", glow: "rgba(201,123,99,0.35)", text: "#fff" }
    : { bg: "#f3d9cc", border: "rgba(201,123,99,0.35)", glow: "rgba(201,123,99,0.15)", text: "#3d2b25" };

  if (isOver) accent = { bg: "#d4a574", border: "#fff", glow: "rgba(212,165,116,0.45)", text: "#fff" };

  const shapeStyle = getShapeStyle(table.shape, w, h);

  return (
    <div
      ref={setDragRef}
      style={{
        position: "absolute",
        left: `${table.pos_x}px`,
        top: `${table.pos_y}px`,
        width: `${w + containerPad * 2}px`,
        height: `${h + containerPad * 2}px`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 1000 : 2,
        opacity: isDragging ? 0.55 : 1,
        cursor: editMode ? "grab" : "default",
      }}
      className="table-furniture-wrapper"
    >
      {/* Chair indicators rendered outside table div */}
      <div style={{ position: "absolute", left: `${containerPad}px`, top: `${containerPad}px`, width: `${w}px`, height: `${h}px`, pointerEvents: "none" }}>
        <ChairIndicators shape={table.shape} w={w} h={h} people={table.capacity_people} pets={table.capacity_pets} />
      </div>

      {/* Table body */}
      <div
        ref={setDropRef}
        {...(editMode ? { ...attributes, ...listeners } : {})}
        className="d-flex flex-column align-items-center justify-content-center position-relative"
        style={{
          position: "absolute",
          left: `${containerPad}px`,
          top: `${containerPad}px`,
          width: `${isDiamond ? Math.min(w, h) * 0.85 : w}px`,
          height: `${isDiamond ? Math.min(w, h) * 0.85 : h}px`,
          ...shapeStyle,
          background: accent.bg,
          border: `2px solid ${accent.border}`,
          boxShadow: `0 4px 18px ${accent.glow}, 0 2px 6px rgba(0,0,0,0.12)`,
          color: accent.text,
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        {/* Inner content - counter-rotate for diamond */}
        <div style={{ transform: isDiamond ? "rotate(-45deg)" : undefined, textAlign: "center", padding: "4px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.72rem", lineHeight: 1.2, maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {table.name}
          </div>
          <div style={{ fontSize: "0.58rem", opacity: 0.85, marginTop: "2px" }}>
            <i className="fas fa-users me-1" />{table.capacity_people}
            {table.capacity_pets > 0 && <><i className="fas fa-paw ms-2 me-1" />{table.capacity_pets}</>}
          </div>
          {hasReservations && (
            <div style={{ fontSize: "0.55rem", marginTop: "3px", background: "rgba(255,255,255,0.25)", borderRadius: "8px", padding: "1px 5px" }}>
              {reservations[0].user_name?.split(" ")[0] || "Reserved"}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons (only in edit mode) */}
      {editMode && (
        <div
          className="table-actions"
          style={{ position: "absolute", top: `${containerPad - 8}px`, right: `${containerPad - 8}px`, display: "flex", flexDirection: "column", gap: "3px", opacity: 0, transition: "opacity 0.15s" }}
        >
          <button
            className="btn-icon-sm"
            onClick={(e) => { e.stopPropagation(); onEdit(table); }}
            title="Edit"
            data-bs-toggle="modal"
            data-bs-target="#tableModal"
          >
            <i className="fas fa-pen" style={{ fontSize: "0.55rem" }} />
          </button>
          <button
            className={`btn-icon-sm ${table.is_occupied ? "btn-icon-warn" : "btn-icon-danger"}`}
            onClick={(e) => { e.stopPropagation(); onMove(table.id, { is_occupied: !table.is_occupied }); }}
            title={table.is_occupied ? "Mark Available" : "Mark Occupied"}
          >
            <i className={`fas ${table.is_occupied ? "fa-door-open" : "fa-user-slash"}`} style={{ fontSize: "0.55rem" }} />
          </button>
          <button
            className="btn-icon-sm btn-icon-dark"
            onClick={(e) => { e.stopPropagation(); onDelete(table.id); }}
            title="Delete"
          >
            <i className="fas fa-times" style={{ fontSize: "0.55rem" }} />
          </button>
        </div>
      )}

      {/* Reservation dots */}
      {reservations.length > 0 && (
        <div style={{ position: "absolute", bottom: `${containerPad - 10}px`, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "3px" }}>
          {reservations.slice(0, 4).map((r) => (
            <div key={r.id} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} title={r.user_name} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Room Element (wall, stage, text, etc.) ───────────────────────────────────
const ELEMENT_PRESETS = {
  wall:      { color: "#5d6d7e", label: "Wall H",    icon: "fa-minus",          vertical: false },
  wall_v:    { color: "#5d6d7e", label: "Wall V",    icon: "fa-grip-lines-vertical", vertical: true },
  stage:     { color: "#7d6608", label: "Stage",     icon: "fa-music",          vertical: false },
  bar:       { color: "#6c3483", label: "Bar",       icon: "fa-glass-martini",  vertical: false },
  window:    { color: "#5dade2", label: "Window",    icon: "fa-border-none",    vertical: false },
  pillar:    { color: "#717d7e", label: "Pillar",    icon: "fa-circle",         vertical: false },
  divider:   { color: "#99a3a4", label: "Divider H", icon: "fa-grip-lines",     vertical: false },
  divider_v: { color: "#99a3a4", label: "Divider V", icon: "fa-grip-lines-vertical", vertical: true },
  door:      { color: "#b7950b", label: "Door",      icon: "fa-door-open",      vertical: false },
  door_v:    { color: "#b7950b", label: "Door V",    icon: "fa-door-open",      vertical: true  },
  text:      { color: "#2c3e50", label: "Text",      icon: "fa-font",           vertical: false },
  entrance:  { color: "#1e8449", label: "Entrance",  icon: "fa-door-open",      vertical: false },
  exit:      { color: "#922b21", label: "Exit",      icon: "fa-sign-out-alt",   vertical: false },
};

function RoomElementItem({ element, onDelete, onUpdate, editMode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `elem-drag-${element.id}`,
    data: { type: "room-element", element },
    disabled: !editMode,
  });

  const preset = ELEMENT_PRESETS[element.element_type] || ELEMENT_PRESETS.wall;
  const color = element.color || preset.color;

  const isText = element.element_type === "text"
    || element.element_type === "entrance"
    || element.element_type === "exit";
  const isDoor  = element.element_type === "door";
  const isDoorV = element.element_type === "door_v";

  const baseStyle = {
    position: "absolute",
    left: `${element.pos_x}px`,
    top: `${element.pos_y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: [
      transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : "",
      element.rotation ? `rotate(${element.rotation}deg)` : "",
    ].filter(Boolean).join(" ") || undefined,
    zIndex: isDragging ? 900 : 1,
    opacity: isDragging ? 0.6 : 1,
    cursor: editMode ? "grab" : "default",
  };

  if (isText) {
    return (
      <div
        ref={setNodeRef}
        {...(editMode ? { ...attributes, ...listeners } : {})}
        style={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          userSelect: "none",
        }}
        className="room-element-wrapper"
      >
        <span style={{
          fontWeight: 800,
          fontSize: `${Math.max(14, element.height * 0.55)}px`,
          color,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textShadow: "0 1px 4px rgba(255,255,255,0.8)",
          whiteSpace: "nowrap",
        }}>
          {element.label || preset.label}
        </span>
        {editMode && (
          <button
            className="btn-icon-sm btn-icon-dark room-element-del"
            style={{ opacity: 0, transition: "opacity 0.15s" }}
            onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
            title="Delete"
          >
            <i className="fas fa-times" style={{ fontSize: "0.55rem" }} />
          </button>
        )}
      </div>
    );
  }

  if (isDoor) {
    const s = Math.min(element.width, element.height);
    return (
      <div
        ref={setNodeRef}
        {...(editMode ? { ...attributes, ...listeners } : {})}
        style={{ ...baseStyle, overflow: "visible" }}
        className="room-element-wrapper"
        title="Door"
      >
        {/* Door SVG: wall segment + swing arc */}
        <svg width={element.width} height={element.height} style={{ overflow: "visible", pointerEvents: "none" }}>
          {/* Wall stub left */}
          <rect x={0} y={element.height / 2 - 4} width={element.width * 0.12} height={8} fill={color} rx={2} />
          {/* Wall stub right */}
          <rect x={element.width * 0.88} y={element.height / 2 - 4} width={element.width * 0.12} height={8} fill={color} rx={2} />
          {/* Door leaf */}
          <rect x={element.width * 0.12} y={element.height / 2 - 3} width={element.width * 0.76} height={6} fill={color} rx={2} />
          {/* Swing arc */}
          <path
            d={`M ${element.width * 0.12} ${element.height / 2} A ${element.width * 0.76} ${element.width * 0.76} 0 0 1 ${element.width * 0.12 + element.width * 0.76 * Math.cos(Math.PI / 2)} ${element.height / 2 - element.width * 0.76 * Math.sin(Math.PI / 2)}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.55}
          />
        </svg>
        {editMode && (
          <button
            className="btn-icon-sm btn-icon-dark room-element-del"
            style={{ position: "absolute", top: "-8px", right: "-8px", opacity: 0, transition: "opacity 0.15s" }}
            onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
            title="Delete"
          >
            <i className="fas fa-times" style={{ fontSize: "0.55rem" }} />
          </button>
        )}
      </div>
    );
  }

  if (isDoorV) {
    return (
      <div
        ref={setNodeRef}
        {...(editMode ? { ...attributes, ...listeners } : {})}
        style={{ ...baseStyle, overflow: "visible" }}
        className="room-element-wrapper"
        title="Door V"
      >
        <svg width={element.width} height={element.height} style={{ overflow: "visible", pointerEvents: "none" }}>
          {/* Wall stub top */}
          <rect x={element.width / 2 - 4} y={0} width={8} height={element.height * 0.12} fill={color} rx={2} />
          {/* Wall stub bottom */}
          <rect x={element.width / 2 - 4} y={element.height * 0.88} width={8} height={element.height * 0.12} fill={color} rx={2} />
          {/* Door leaf */}
          <rect x={element.width / 2 - 3} y={element.height * 0.12} width={6} height={element.height * 0.76} fill={color} rx={2} />
          {/* Swing arc – free end sweeps 90° clockwise to the right */}
          <path
            d={`M ${element.width / 2} ${element.height * 0.88} A ${element.height * 0.76} ${element.height * 0.76} 0 0 1 ${element.width / 2 + element.height * 0.76} ${element.height * 0.12}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.55}
          />
        </svg>
        {editMode && (
          <button
            className="btn-icon-sm btn-icon-dark room-element-del"
            style={{ position: "absolute", top: "-8px", right: "-8px", opacity: 0, transition: "opacity 0.15s" }}
            onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
            title="Delete"
          >
            <i className="fas fa-times" style={{ fontSize: "0.55rem" }} />
          </button>
        )}
      </div>
    );
  }

  const isPillar = element.element_type === "pillar";

  return (
    <div
      ref={setNodeRef}
      {...(editMode ? { ...attributes, ...listeners } : {})}
      style={{
        ...baseStyle,
        background: color,
        borderRadius: isPillar ? "50%" : "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        boxShadow: "inset 0 1px 3px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.25)",
      }}
      className="room-element-wrapper"
      title={element.label || preset.label}
    >
      {element.label && !isPillar && (
        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.85)", fontWeight: 600, letterSpacing: "0.05em", pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 4px" }}>
          {element.label}
        </span>
      )}
      {editMode && (
        <button
          className="btn-icon-sm btn-icon-dark room-element-del"
          style={{ position: "absolute", top: "-6px", right: "-6px", opacity: 0, transition: "opacity 0.15s" }}
          onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
          title="Delete"
        >
          <i className="fas fa-times" style={{ fontSize: "0.55rem" }} />
        </button>
      )}
    </div>
  );
}

// ─── Draggable Reservation Card (sidebar) ────────────────────────────────────
function ReservationCard({ reservation, onUpdateStatus, onUnseat }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `res-${reservation.id}`,
    data: { type: "reservation", reservation },
  });

  const statusColors = {
    confirmed: { bg: "#d5f5e3", text: "#1e8449", dot: "#27ae60" },
    cancelled:  { bg: "#fadbd8", text: "#922b21", dot: "#e74c3c" },
    pending:    { bg: "#fef9e7", text: "#7d6608", dot: "#f1c40f" },
  };
  const sc = statusColors[reservation.status] || statusColors.pending;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 9999 : undefined,
        opacity: isDragging ? 0.8 : 1,
        touchAction: "none",
      }}
    >
      <div
        style={{
          background: "#fffaf7",
          borderRadius: "12px",
          padding: "10px 12px",
          boxShadow: isDragging ? "0 8px 24px rgba(61,43,37,0.18)" : "0 2px 8px rgba(61,43,37,0.08)",
          borderLeft: `4px solid ${sc.dot}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
          cursor: "grab",
          transition: "box-shadow 0.15s",
        }}
      >
        <div {...listeners} {...attributes} style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {reservation.user_name || "Guest"}
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px", flexWrap: "wrap" }}>
            <span style={{ background: "#fef0e8", color: "#c97b63", borderRadius: "20px", padding: "1px 8px", fontSize: "0.65rem", fontWeight: 600 }}>
              {reservation.reservation_time?.substring(0, 5)}
            </span>
            <span style={{ background: sc.bg, color: sc.text, borderRadius: "20px", padding: "1px 8px", fontSize: "0.65rem", fontWeight: 600 }}>
              {reservation.status}
            </span>
          </div>
          <div style={{ marginTop: "4px", fontSize: "0.68rem", color: "#8a7065" }}>
            <i className="fas fa-users me-1" />{reservation.people_count}
            {reservation.pet_id && <><i className="fas fa-paw ms-2 me-1 text-success" />Pet</>}
            {reservation.notes && <span className="ms-2" title={reservation.notes}><i className="fas fa-sticky-note" /></span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "8px" }}>
          {reservation.status !== "confirmed" && reservation.status !== "cancelled" && (
            <button onClick={() => onUpdateStatus(reservation.id, "confirmed")} className="btn-icon-sm btn-icon-success" title="Confirm">
              <i className="fas fa-check" style={{ fontSize: "0.55rem" }} />
            </button>
          )}
          {reservation.table_id && onUnseat && (
            <button onClick={() => onUnseat(reservation.id)} className="btn-icon-sm btn-icon-warn" title="Remove from table">
              <i className="fas fa-chair" style={{ fontSize: "0.55rem" }} />
            </button>
          )}
          {reservation.status !== "cancelled" && (
            <button onClick={() => onUpdateStatus(reservation.id, "cancelled")} className="btn-icon-sm btn-icon-danger-outline" title="Cancel">
              <i className="fas fa-times" style={{ fontSize: "0.55rem" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reservations mini-chart ─────────────────────────────────────────────────
const CHART_MODES = ["hour", "day", "month"];
const CHART_LABELS = { hour: "By hour", day: "By day", month: "By month" };

function ReservationsChart({ reservations, onBarClick, selectedDate }) {
  const [mode, setMode] = useState("hour");
  const [activeBar, setActiveBar] = useState(null);

  const buildData = () => {
    if (mode === "hour") {
      const counts = {};
      for (let h = 0; h < 24; h++) counts[h] = 0;
      reservations.forEach((r) => {
        const h = parseInt(r.reservation_time?.substring(0, 2) || "0", 10);
        counts[h] = (counts[h] || 0) + 1;
      });
      return Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([h, count]) => ({ label: `${h}h`, key: parseInt(h), count }));
    }
    if (mode === "day") {
      const counts = {};
      reservations.forEach((r) => {
        const d = r.reservation_date || "?";
        counts[d] = (counts[d] || 0) + 1;
      });
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([d, count]) => ({ label: d.slice(5), key: d, count }));
    }
    if (mode === "month") {
      const counts = {};
      reservations.forEach((r) => {
        const m = r.reservation_date?.substring(0, 7) || "?";
        counts[m] = (counts[m] || 0) + 1;
      });
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, count]) => {
          const [y, mo] = m.split("-");
          const name = new Date(+y, +mo - 1).toLocaleString("default", { month: "short" });
          return { label: `${name} ${y}`, key: m, count };
        });
    }
    return [];
  };

  const data = buildData();

  return (
    <div style={{ padding: "0 10px 10px" }}>
      {/* Mode tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {CHART_MODES.map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setActiveBar(null); onBarClick(null); }}
            style={{
              flex: 1, border: "none", borderRadius: "8px", padding: "4px 2px",
              fontSize: "0.62rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer",
              background: mode === m ? "#c97b63" : "#fdf3ee",
              color: mode === m ? "white" : "#8a7065",
              transition: "all 0.15s",
            }}
          >
            {CHART_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: "#fdf6f1", borderRadius: "12px", padding: "8px 4px 4px" }}>
        {data.length === 0 ? (
          <div style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#dcc9bf" }}>
            <i className="fas fa-chart-bar" style={{ fontSize: "1.4rem" }} />
            <span style={{ fontSize: "0.65rem", marginTop: "6px" }}>No reservations</span>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={data} barCategoryGap="35%">
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: "#a08070" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontSize: "0.7rem" }}
              cursor={{ fill: "rgba(99,102,241,0.08)" }}
              formatter={(v) => [v, "Reservations"]}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              barSize={8}
              cursor="pointer"
              onClick={(data) => {
                if (!data) return;
                const next = activeBar === data.key ? null : data.key;
                setActiveBar(next);
                onBarClick(next === null ? null : { mode, key: next });
              }}
            >
              {data.map((entry) => {
                const isActive = entry.key === activeBar;
                // In day mode also highlight the bar matching the current selected date
                const isSelected = mode === "day" && entry.key === selectedDate;
                return (
                  <Cell
                    key={entry.key}
                    fill={isActive || isSelected ? "#c97b63" : "#f3d9cc"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
        {activeBar !== null && (
          <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#c97b63", fontWeight: 600, marginTop: "2px" }}>
            <i className="fas fa-filter me-1" />
            Filtered · click again to clear
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hourly accordion group ───────────────────────────────────────────────────
function HourGroup({ hour, reservations, onUpdateStatus, onUnseat, defaultOpen, scrollRef }) {
  const [open, setOpen] = useState(defaultOpen || false);
  // Scroll into view when made active via chart click
  const divRef = useRef(null);
  useEffect(() => {
    if (scrollRef) {
      scrollRef.current = { scrollIntoView: () => divRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) };
    }
  }, [scrollRef]);
  return (
    <div ref={divRef} style={{ marginBottom: "6px" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: open ? "#fef0e8" : "#fdf6f1",
          border: "none",
          borderRadius: "8px",
          padding: "6px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "0.75rem", color: open ? "#c97b63" : "#6b4f43" }}>
          {hour}:00 – {hour + 1}:00
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ background: open ? "#c97b63" : "#dcc9bf", color: "white", borderRadius: "20px", padding: "1px 7px", fontSize: "0.65rem", fontWeight: 700 }}>
            {reservations.length}
          </span>
          <i className={`fas fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: "0.6rem", color: "#a08070" }} />
        </span>
      </button>
      {open && (
        <div style={{ padding: "6px 4px 0" }}>
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} onUpdateStatus={onUpdateStatus} onUnseat={onUnseat} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Layout CRUD modal ────────────────────────────────────────────────────────
function LayoutModal({ layouts, activeLayoutId, onSelect, onCreate, onRename, onDelete }) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="modal fade" id="layoutModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="fw-bold">Manage Layouts</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body p-4">
            {layouts.map((l) => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                {editId === l.id ? (
                  <>
                    <input
                      className="form-control form-control-sm rounded-3"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-sm btn-primary rounded-3"
                      onClick={() => { onRename(l.id, editName); setEditId(null); }}
                    >Save</button>
                    <button className="btn btn-sm btn-secondary rounded-3" onClick={() => setEditId(null)}>×</button>
                  </>
                ) : (
                  <>
                    <button
                      data-bs-dismiss="modal"
                      onClick={() => onSelect(l.id)}
                      style={{
                        flex: 1, textAlign: "left", border: activeLayoutId === l.id ? "2px solid #4338ca" : "2px solid transparent",
                        background: activeLayoutId === l.id ? "#fef0e8" : "#fdf6f1",
                        borderRadius: "10px", padding: "6px 12px", cursor: "pointer", fontWeight: activeLayoutId === l.id ? 700 : 400,
                        color: activeLayoutId === l.id ? "#c97b63" : "#3d2b25", fontSize: "0.85rem",
                      }}
                    >
                      <i className="fas fa-layer-group me-2" />{l.name}
                      {l.is_default && <span style={{ marginLeft: "6px", fontSize: "0.6rem", background: "#fef9e7", color: "#7d6608", borderRadius: "8px", padding: "1px 6px" }}>default</span>}
                    </button>
                    <button className="btn-icon-sm" title="Rename" onClick={() => { setEditId(l.id); setEditName(l.name); }}>
                      <i className="fas fa-pen" style={{ fontSize: "0.55rem" }} />
                    </button>
                    <button className="btn-icon-sm btn-icon-danger" title="Delete" onClick={() => onDelete(l.id)}>
                      <i className="fas fa-trash" style={{ fontSize: "0.55rem" }} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <hr style={{ margin: "14px 0" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="form-control rounded-3"
                placeholder="New layout name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { onCreate(newName.trim()); setNewName(""); } }}
              />
              <button
                className="btn btn-primary rounded-3 px-3"
                onClick={() => { if (newName.trim()) { onCreate(newName.trim()); setNewName(""); } }}
              >
                <i className="fas fa-plus" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add/Edit Table Modal ─────────────────────────────────────────────────────
const SHAPES = [
  { value: "square",    label: "Square",    icon: "⬜" },
  { value: "round",     label: "Round",     icon: "⭕" },
  { value: "rectangle", label: "Rectangle", icon: "▬" },
  { value: "diamond",   label: "Diamond",   icon: "◆" },
  { value: "oval",      label: "Oval",      icon: "⬮" },
];

function TableModal({ editingTable, newTable, setEditingTable, setNewTable, onSubmit, layoutId }) {
  const isEdit = !!editingTable;
  const data = isEdit ? editingTable : newTable;
  const setData = isEdit ? setEditingTable : setNewTable;

  return (
    <div className="modal fade" id="tableModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          <form onSubmit={onSubmit}>
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold">{isEdit ? "Edit Table" : "Add Table"}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => setEditingTable(null)} />
            </div>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Name / Number</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={data.name || ""}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  required
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Guests</label>
                  <input type="number" min="1" className="form-control rounded-3" value={data.capacity_people || 2} onChange={(e) => setData({ ...data, capacity_people: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Pets</label>
                  <input type="number" min="0" className="form-control rounded-3" value={data.capacity_pets || 0} onChange={(e) => setData({ ...data, capacity_pets: e.target.value })} />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Width (px)</label>
                  <input type="number" min="50" max="220" className="form-control rounded-3" value={data.width || 80} onChange={(e) => setData({ ...data, width: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Height (px)</label>
                  <input type="number" min="50" max="220" className="form-control rounded-3" value={data.height || 80} onChange={(e) => setData({ ...data, height: e.target.value })} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Shape</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                  {SHAPES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setData({ ...data, shape: s.value })}
                      style={{
                        border: `2px solid ${data.shape === s.value ? "#c97b63" : "#ead8cc"}`,
                        background: data.shape === s.value ? "#fef0e8" : "#fffaf7",
                        borderRadius: "10px",
                        padding: "8px 4px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "1.2rem" }}>{s.icon}</div>
                      <div style={{ fontSize: "0.6rem", fontWeight: 600, color: data.shape === s.value ? "#c97b63" : "#8a7065", marginTop: "2px" }}>{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold" data-bs-dismiss="modal">
                {isEdit ? "Save Changes" : "Add Table"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Add Tables Modal ────────────────────────────────────────────────────
function BulkTableModal({ onBulkCreate }) {
  const [prefix, setPrefix] = useState("T");
  const [count, setCount] = useState(4);
  const [shape, setShape] = useState("square");
  const [people, setPeople] = useState(4);
  const [pets, setPets] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onBulkCreate({ prefix, count: parseInt(count), shape, people: parseInt(people), pets: parseInt(pets) });
  };

  return (
    <div className="modal fade" id="bulkTableModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          <form onSubmit={handleSubmit}>
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-bold">Add Multiple Tables</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body p-4">
              <div style={{ background: "#fdf6f1", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", fontSize: "0.8rem", color: "#6b4f43" }}>
                <i className="fas fa-info-circle me-2 text-primary" />
                Tables will be named <strong>{prefix}1</strong>, <strong>{prefix}2</strong>… and placed in a grid.
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Name Prefix</label>
                  <input className="form-control rounded-3" value={prefix} onChange={(e) => setPrefix(e.target.value)} required />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">How many</label>
                  <input type="number" min="1" max="50" className="form-control rounded-3" value={count} onChange={(e) => setCount(e.target.value)} />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Guests / table</label>
                  <input type="number" min="1" className="form-control rounded-3" value={people} onChange={(e) => setPeople(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Pets / table</label>
                  <input type="number" min="0" className="form-control rounded-3" value={pets} onChange={(e) => setPets(e.target.value)} />
                </div>
              </div>
              <div className="mb-1">
                <label className="form-label small fw-bold text-muted text-uppercase">Shape</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                  {SHAPES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setShape(s.value)}
                      style={{
                        border: `2px solid ${shape === s.value ? "#c97b63" : "#ead8cc"}`,
                        background: shape === s.value ? "#fef0e8" : "#fffaf7",
                        borderRadius: "10px",
                        padding: "8px 4px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "1.2rem" }}>{s.icon}</div>
                      <div style={{ fontSize: "0.6rem", fontWeight: 600, color: shape === s.value ? "#c97b63" : "#8a7065", marginTop: "2px" }}>{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold" data-bs-dismiss="modal">
                <i className="fas fa-layer-group me-2" />Create {count} Tables
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Add Element Toolbar ──────────────────────────────────────────────────────
function AddElementPanel({ onAdd }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("wall");
  const [color, setColor] = useState("");

  const preset = ELEMENT_PRESETS[type] || ELEMENT_PRESETS.wall;

  const defaults = {
    wall:      { width: 180, height: 16 },
    wall_v:    { width: 16,  height: 180 },
    stage:     { width: 220, height: 60 },
    bar:       { width: 160, height: 40 },
    window:    { width: 100, height: 14 },
    pillar:    { width: 28,  height: 28 },
    divider:   { width: 140, height: 12 },
    divider_v: { width: 12,  height: 140 },
    door:      { width: 80,  height: 40 },
    door_v:    { width: 40,  height: 80 },
    text:      { width: 160, height: 36 },
    entrance:  { width: 120, height: 36 },
    exit:      { width: 100, height: 36 },
  };

  const handleAdd = () => {
    const def = defaults[type] || { width: 120, height: 20 };
    onAdd({
      element_type: type,
      pos_x: 60,
      pos_y: 60,
      width: def.width,
      height: def.height,
      rotation: 0,
      color: color || preset.color,
      label: label || preset.label,
    });
    setLabel("");
    setColor("");
  };

  return (
    <div
      style={{
        background: "#fdf6f1",
        borderRadius: "16px",
        padding: "14px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "0.75rem", color: "#3d2b25", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <i className="fas fa-shapes me-2 text-primary" />Add Element
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
        {Object.entries(ELEMENT_PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            style={{
              border: `2px solid ${type === key ? "#c97b63" : "#ead8cc"}`,
              background: type === key ? "#fef0e8" : "#fffaf7",
              borderRadius: "8px",
              padding: "5px 4px",
              cursor: "pointer",
              textAlign: "center",
              fontSize: "0.6rem",
              fontWeight: type === key ? 700 : 500,
              color: type === key ? "#c97b63" : "#8a7065",
              transition: "all 0.15s",
            }}
          >
            <i className={`fas ${p.icon} d-block mb-1`} style={{ fontSize: "0.75rem" }} />
            {p.label}
          </button>
        ))}
      </div>
      {(type === "text" || type === "entrance" || type === "exit") && (
        <input
          className="form-control form-control-sm rounded-3"
          placeholder={`Label (e.g. "${preset.label}")`}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      )}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <label style={{ fontSize: "0.7rem", color: "#8a7065", flex: 1 }}>Colour</label>
        <input
          type="color"
          value={color || preset.color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: "36px", height: "28px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer", padding: "2px" }}
        />
      </div>
      <button
        onClick={handleAdd}
        style={{ background: "linear-gradient(135deg, #c97b63, #b56950)", color: "white", border: "none", borderRadius: "10px", padding: "8px 14px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
      >
        <i className="fas fa-plus me-2" />Place on Canvas
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Board Component
// ═══════════════════════════════════════════════════════════════════════════════
function PlaceReservationBoard({ placeId }) {
  const [layouts, setLayouts] = useState([]);
  const [activeLayoutId, setActiveLayoutId] = useState(null);
  const [tables, setTables] = useState([]);
  const [elements, setElements] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]); // unfiltered – for chart
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [sidebarSection, setSidebarSection] = useState("upcoming"); // upcoming | seated
  const [newTable, setNewTable] = useState({ name: "", capacity_people: 2, capacity_pets: 0, shape: "square", width: 80, height: 80 });
  const tokenPlace = () => localStorage.getItem("token_place");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchLayouts = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/places/${placeId}/layouts`);
    if (res.ok) {
      const data = await res.json();
      setLayouts(data);
      if (data.length > 0 && !activeLayoutId) {
        const def = data.find((l) => l.is_default) || data[0];
        setActiveLayoutId(def.id);
        return def.id;
      }
      return activeLayoutId;
    }
    return null;
  }, [placeId, activeLayoutId]);

  const fetchTables = useCallback(async (layoutId) => {
    const url = layoutId
      ? `${backendUrl}/api/places/${placeId}/tables?layout_id=${layoutId}`
      : `${backendUrl}/api/places/${placeId}/tables`;
    const res = await fetch(url);
    if (res.ok) setTables(await res.json());
  }, [placeId]);

  const fetchElements = useCallback(async (layoutId) => {
    if (!layoutId) { setElements([]); return; }
    const res = await fetch(`${backendUrl}/api/layouts/${layoutId}/elements`);
    if (res.ok) setElements(await res.json());
  }, []);

  const fetchReservations = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/places/${placeId}/reservations?date=${selectedDate}`);
    if (res.ok) setReservations(await res.json());
  }, [placeId, selectedDate]);

  // Fetch ALL reservations (no date filter) so the chart shows the full picture
  const fetchAllReservations = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/places/${placeId}/reservations`);
    if (res.ok) setAllReservations(await res.json());
  }, [placeId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const lid = await fetchLayouts();
      await Promise.all([
        fetchTables(lid || activeLayoutId),
        fetchElements(lid || activeLayoutId),
        fetchReservations(),
        fetchAllReservations(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchLayouts, fetchTables, fetchElements, fetchReservations, fetchAllReservations, activeLayoutId]);

  // Full load only when the place changes (layouts, tables, elements + reservations)
  useEffect(() => { if (placeId) fetchAll(); }, [placeId]);
  // Lightweight reload: only reservations when the selected date changes
  useEffect(() => { if (placeId) fetchReservations(); }, [selectedDate]);
  // Keep full-range chart data fresh when the place changes
  useEffect(() => { if (placeId) fetchAllReservations(); }, [placeId]);

  const switchLayout = async (id) => {
    setActiveLayoutId(id);
    await Promise.all([fetchTables(id), fetchElements(id)]);
  };

  // ── Layout CRUD ────────────────────────────────────────────────────────────
  const handleCreateLayout = async (name) => {
    const res = await fetch(`${backendUrl}/api/places/${placeId}/layouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const layout = await res.json();
      setLayouts((prev) => [...prev, layout]);
      switchLayout(layout.id);
    }
  };

  const handleRenameLayout = async (id, name) => {
    const res = await fetch(`${backendUrl}/api/layouts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setLayouts((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
  };

  const handleDeleteLayout = async (id) => {
    if (!confirm("Delete this layout and all its tables/elements?")) return;
    const res = await fetch(`${backendUrl}/api/layouts/${id}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = layouts.filter((l) => l.id !== id);
      setLayouts(remaining);
      if (activeLayoutId === id) {
        const next = remaining[0] || null;
        setActiveLayoutId(next?.id || null);
        await Promise.all([fetchTables(next?.id || null), fetchElements(next?.id || null)]);
      }
    }
  };

  // ── Table CRUD ─────────────────────────────────────────────────────────────
  const handleSaveTable = async (e) => {
    e.preventDefault();
    const payload = editingTable
      ? editingTable
      : { ...newTable, layout_id: activeLayoutId };
    const url = editingTable ? `${backendUrl}/api/tables/${editingTable.id}` : `${backendUrl}/api/places/${placeId}/tables`;
    const method = editingTable ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEditingTable(null);
      setNewTable({ name: "", capacity_people: 2, capacity_pets: 0, shape: "square", width: 80, height: 80 });
      await fetchTables(activeLayoutId);
    } else {
      alert(`Error: ${await res.text()}`);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm("Delete this table?")) return;
    await fetch(`${backendUrl}/api/tables/${id}`, { method: "DELETE" });
    await fetchTables(activeLayoutId);
  };

  const handleMoveTable = async (id, data) => {
    await fetch(`${backendUrl}/api/tables/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlace()}` },
      body: JSON.stringify(data),
    });
    await fetchTables(activeLayoutId);
  };

  // ── Bulk Create ────────────────────────────────────────────────────────────
  const handleBulkCreate = async ({ prefix, count, shape, people, pets }) => {
    const GRID_COLS = 4;
    const CELL_SIZE = 140;
    const START_X = 30;
    const START_Y = 30;

    const payload = Array.from({ length: count }, (_, i) => ({
      name: `${prefix}${i + 1}`,
      capacity_people: people,
      capacity_pets: pets,
      shape,
      width: 80,
      height: 80,
      layout_id: activeLayoutId,
      pos_x: START_X + (i % GRID_COLS) * CELL_SIZE,
      pos_y: START_Y + Math.floor(i / GRID_COLS) * CELL_SIZE,
    }));

    const res = await fetch(`${backendUrl}/api/places/${placeId}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) await fetchTables(activeLayoutId);
    else alert(`Error: ${await res.text()}`);
  };

  // ── Room elements ──────────────────────────────────────────────────────────
  const handleAddElement = async (elementData) => {
    if (!activeLayoutId) return alert("Select or create a layout first.");
    const res = await fetch(`${backendUrl}/api/layouts/${activeLayoutId}/elements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(elementData),
    });
    if (res.ok) await fetchElements(activeLayoutId);
  };

  const handleDeleteElement = async (id) => {
    await fetch(`${backendUrl}/api/elements/${id}`, { method: "DELETE" });
    setElements((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Reservation actions ────────────────────────────────────────────────────
  const handleUpdateStatus = async (reservationId, status) => {
    const res = await fetch(`${backendUrl}/api/reservations/${reservationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlace()}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchReservations();
    else alert((await res.json()).msg || "Error");
  };

  const handleUnseatReservation = async (reservationId) => {
    const res = await fetch(`${backendUrl}/api/reservations/${reservationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlace()}` },
      body: JSON.stringify({ table_id: null }),
    });
    if (res.ok) fetchReservations();
  };

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over && active.data.current?.type !== "furniture" && active.data.current?.type !== "room-element") return;

    // Seat reservation on table
    if (active.data.current?.type === "reservation" && over?.data.current?.type === "table") {
      const res = await fetch(`${backendUrl}/api/reservations/${active.data.current.reservation.id}/seat`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenPlace()}` },
        body: JSON.stringify({ table_id: over.data.current.table.id, status: "confirmed" }),
      });
      if (!res.ok) alert(`Drop failed: ${await res.text()}`);
      fetchReservations();
      return;
    }

    // Move table furniture
    if (active.data.current?.type === "furniture") {
      const table = active.data.current.table;
      const newX = Math.max(0, table.pos_x + event.delta.x);
      const newY = Math.max(0, table.pos_y + event.delta.y);
      // Optimistic update
      setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, pos_x: Math.round(newX), pos_y: Math.round(newY) } : t));
      await fetch(`${backendUrl}/api/tables/${table.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pos_x: Math.round(newX), pos_y: Math.round(newY) }),
      });
      return;
    }

    // Move room element
    if (active.data.current?.type === "room-element") {
      const elem = active.data.current.element;
      const newX = Math.max(0, elem.pos_x + event.delta.x);
      const newY = Math.max(0, elem.pos_y + event.delta.y);
      setElements((prev) => prev.map((e) => e.id === elem.id ? { ...e, pos_x: Math.round(newX), pos_y: Math.round(newY) } : e));
      await fetch(`${backendUrl}/api/elements/${elem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pos_x: Math.round(newX), pos_y: Math.round(newY) }),
      });
      return;
    }
  };

  // ── Sidebar data & chart filter ────────────────────────────────────────────
  const [chartFilter, setChartFilter] = useState(null); // { mode, key } | null

  const allActive = reservations.filter((r) => r.status !== "cancelled");
  const unseatedReservations = allActive.filter((r) => !r.table_id);
  const seatedReservations   = allActive.filter((r) => r.table_id);

  const applyChartFilter = (list) => {
    if (!chartFilter) return list;
    return list.filter((r) => {
      if (chartFilter.mode === "hour")  return parseInt(r.reservation_time?.substring(0, 2) || "0", 10) === chartFilter.key;
      if (chartFilter.mode === "day")   return r.reservation_date === chartFilter.key;
      if (chartFilter.mode === "month") return r.reservation_date?.startsWith(chartFilter.key);
      return true;
    });
  };

  const groupByHour = (list) => {
    const groups = {};
    list.forEach((r) => {
      const h = parseInt(r.reservation_time?.substring(0, 2) || "0", 10);
      if (!groups[h]) groups[h] = [];
      groups[h].push(r);
    });
    return groups;
  };

  const filteredUnseated = applyChartFilter(unseatedReservations);
  const filteredSeated   = applyChartFilter(seatedReservations);
  const unseatedGroups = groupByHour(filteredUnseated);
  const seatedGroups   = groupByHour(filteredSeated);
  const currentHour = new Date().getHours();

  const activeLayout = layouts.find((l) => l.id === activeLayoutId);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <>
    <div className="prb-root">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="prb-layout">

          {/* ── SIDEBAR ── */}
          <aside className="prb-sidebar">
            {/* Mini chart – uses ALL reservations (no date filter) */}
            <ReservationsChart
              reservations={allReservations.filter((r) => r.status !== "cancelled")}
              selectedDate={selectedDate}
              onBarClick={(filter) => {
                setChartFilter(filter);
                // If the key looks like YYYY-MM-DD it's a day bar → jump the date picker
                if (filter?.key && /^\d{4}-\d{2}-\d{2}$/.test(String(filter.key))) {
                  setSelectedDate(filter.key);
                }
              }}
            />

            {/* Compact date picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 12px 10px" }}>
              <label className="prb-label" style={{ margin: 0, whiteSpace: "nowrap" }}>
                <i className="fas fa-calendar-alt me-1" />Date
              </label>
              <input
                type="date"
                className="prb-date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", gap: "6px", padding: "0 12px 10px" }}>
              {[
                { key: "upcoming", label: "Upcoming", count: filteredUnseated.length },
                { key: "seated",   label: "Seated",   count: filteredSeated.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setSidebarSection(key)}
                  style={{
                    flex: 1, border: "none", borderRadius: "10px", padding: "7px 4px",
                    fontWeight: 700, fontSize: "0.72rem", cursor: "pointer",
                    background: sidebarSection === key ? "#c97b63" : "#fdf3ee",
                    color: sidebarSection === key ? "white" : "#8a7065",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                  <span style={{
                    marginLeft: "5px",
                    background: sidebarSection === key ? "rgba(255,255,255,0.25)" : "#ead8cc",
                    borderRadius: "20px", padding: "0 5px", fontSize: "0.65rem",
                  }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Active filter badge */}
            {chartFilter && (
              <div style={{ margin: "0 12px 8px", background: "#fef0e8", borderRadius: "8px", padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.65rem", color: "#c97b63", fontWeight: 600 }}>
                  <i className="fas fa-filter me-1" />Filtered by chart
                </span>
                <button onClick={() => setChartFilter(null)} style={{ border: "none", background: "none", color: "#c97b63", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>
                  ✕ Clear
                </button>
              </div>
            )}

            {/* Reservation list */}
            <div className="prb-sidebar-list">
              {sidebarSection === "upcoming" && (
                <>
                  {Object.keys(unseatedGroups).length === 0 ? (
                    <div className="prb-empty-state">
                      <i className="fas fa-calendar-day fa-2x mb-2 opacity-25" />
                      <p>{chartFilter ? "No matches for filter" : "No upcoming reservations"}</p>
                      {!chartFilter && <p style={{ fontSize: "0.72rem" }}>Drag to a table to seat</p>}
                    </div>
                  ) : (
                    Object.entries(unseatedGroups)
                      .sort(([a], [b]) => a - b)
                      .map(([hour, list]) => (
                        <HourGroup
                          key={hour}
                          hour={parseInt(hour)}
                          reservations={list}
                          onUpdateStatus={handleUpdateStatus}
                          onUnseat={handleUnseatReservation}
                          defaultOpen={chartFilter ? true : parseInt(hour) === currentHour}
                        />
                      ))
                  )}
                </>
              )}
              {sidebarSection === "seated" && (
                <>
                  {Object.keys(seatedGroups).length === 0 ? (
                    <div className="prb-empty-state">
                      <i className="fas fa-chair fa-2x mb-2 opacity-25" />
                      <p>{chartFilter ? "No matches for filter" : "No seated guests yet"}</p>
                    </div>
                  ) : (
                    Object.entries(seatedGroups)
                      .sort(([a], [b]) => a - b)
                      .map(([hour, list]) => (
                        <HourGroup
                          key={hour}
                          hour={parseInt(hour)}
                          reservations={list}
                          onUpdateStatus={handleUpdateStatus}
                          onUnseat={handleUnseatReservation}
                          defaultOpen={true}
                        />
                      ))
                  )}
                </>
              )}
            </div>
          </aside>

          {/* ── MAIN CANVAS AREA ── */}
          <main className="prb-main">
            {/* Toolbar */}
            <div className="prb-toolbar">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Layout selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="fas fa-layer-group" style={{ color: "#b56950", fontSize: "0.9rem" }} />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
                    {activeLayout?.name || "No layout"}
                  </span>
                </div>
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => switchLayout(l.id)}
                    style={{
                      border: `2px solid ${l.id === activeLayoutId ? "#c97b63" : "#ead8cc"}`,
                      background: l.id === activeLayoutId ? "#fef0e8" : "#fffaf7",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "0.72rem",
                      fontWeight: l.id === activeLayoutId ? 700 : 500,
                      color: l.id === activeLayoutId ? "#c97b63" : "#8a7065",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {l.name}
                  </button>
                ))}
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#layoutModal"
                  style={{ border: "2px dashed #dcc9bf", background: "#fffaf7", borderRadius: "20px", padding: "4px 12px", fontSize: "0.72rem", color: "#a08070", cursor: "pointer" }}
                >
                  <i className="fas fa-cog me-1" /> Manage
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setEditMode((m) => !m)}
                  style={{
                    border: "none", borderRadius: "20px", padding: "6px 16px",
                    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                    background: editMode ? "#c97b63" : "#fdf3ee",
                    color: editMode ? "white" : "#6b4f43",
                    transition: "all 0.15s",
                  }}
                  title={editMode ? "Exit edit mode" : "Enter edit mode to move elements"}
                >
                  <i className={`fas ${editMode ? "fa-lock-open" : "fa-lock"} me-2`} />
                  {editMode ? "Editing" : "View"}
                </button>
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#bulkTableModal"
                  style={{ border: "none", borderRadius: "20px", padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", background: "#fdf3ee", color: "#6b4f43" }}
                >
                  <i className="fas fa-th me-1" /> Bulk Add
                </button>
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#tableModal"
                  onClick={() => setEditingTable(null)}
                  style={{ border: "none", borderRadius: "20px", padding: "6px 16px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg, #c97b63, #b56950)", color: "white" }}
                >
                  <i className="fas fa-plus me-2" />New Table
                </button>
              </div>
            </div>

            {/* Canvas + element panel */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", gap: "12px" }}>
              {/* Floor canvas */}
              <div
                className="prb-canvas"
                style={{
                  backgroundImage: "radial-gradient(#c5cfe0 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              >
                {/* Zone label if no layout */}
                {!activeLayoutId && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", opacity: 0.25, pointerEvents: "none" }}>
                    <i className="fas fa-layer-group" style={{ fontSize: "3rem", color: "#c97b63" }} />
                    <p style={{ marginTop: "12px", fontWeight: 700, fontSize: "1rem", color: "#3d2b25" }}>
                      Create or select a layout to get started
                    </p>
                  </div>
                )}

                {/* Room elements */}
                {elements.map((elem) => (
                  <RoomElementItem
                    key={elem.id}
                    element={elem}
                    onDelete={handleDeleteElement}
                    onUpdate={fetchElements}
                    editMode={editMode}
                  />
                ))}

                {/* Tables */}
                {tables.map((table) => (
                  <TableFurniture
                    key={table.id}
                    table={table}
                    reservations={reservations.filter((r) => r.table_id === table.id && r.status !== "cancelled")}
                    onDelete={handleDeleteTable}
                    onEdit={(t) => setEditingTable(t)}
                    onMove={handleMoveTable}
                    editMode={editMode}
                  />
                ))}
              </div>

              {/* Add Element Panel (only in edit mode) */}
              {editMode && (
                <div style={{ width: "190px", flexShrink: 0, overflowY: "auto" }}>
                  <AddElementPanel onAdd={handleAddElement} />
                </div>
              )}
            </div>
          </main>
        </div>
      </DndContext>

      {/* Global styles */}
      <style>{`
        .prb-root {
          --sidebar-w: 280px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          height: 88vh;
          display: flex;
          background: #eef0f8;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
        }
        .prb-layout {
          display: flex;
          width: 100%;
          height: 100%;
        }
        .prb-sidebar {
          width: var(--sidebar-w);
          flex-shrink: 0;
          background: #fffaf7;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #ead8cc;
          overflow: hidden;
        }
        .prb-sidebar-section {
          padding: 16px 16px 10px;
        }
        .prb-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          color: #a08070;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .prb-date-input {
          width: 100%;
          border: 2px solid #ead8cc;
          border-radius: 10px;
          padding: 7px 10px;
          font-size: 0.82rem;
          color: #3d2b25;
          font-weight: 600;
          outline: none;
          transition: border-color 0.15s;
          background: #fdf6f1;
        }
        .prb-date-input:focus { border-color: #c97b63; background: #fffaf7; }
        .prb-sidebar-list {
          flex: 1;
          overflow-y: auto;
          padding: 4px 10px 16px;
        }
        .prb-empty-state {
          text-align: center;
          padding: 40px 16px;
          color: #a08070;
          font-size: 0.8rem;
        }
        .prb-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .prb-toolbar {
          background: #fffaf7;
          border-bottom: 1px solid #ead8cc;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .prb-canvas {
          flex: 1;
          position: relative;
          overflow: auto;
          background: #f7ebe2;
          background-image: radial-gradient(circle, #dcc9bf 1px, transparent 1px);
          background-size: 24px 24px;
          min-width: 0;
          min-height: 600px;
        }
        /* Table action buttons */
        .table-furniture-wrapper:hover .table-actions { opacity: 1 !important; }
        .room-element-wrapper:hover .room-element-del { opacity: 1 !important; }
        .btn-icon-sm {
          width: 22px; height: 22px;
          border-radius: 50%;
          border: none;
          background: #fffaf7;
          color: #3d2b25;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(61,43,37,0.18);
          transition: transform 0.1s;
          flex-shrink: 0;
        }
        .btn-icon-sm:hover { transform: scale(1.15); }
        .btn-icon-success { background: #16a34a; color: white; }
        .btn-icon-danger { background: #dc2626; color: white; }
        .btn-icon-danger-outline { background: #fffaf7; color: #dc2626; border: 1.5px solid #dc2626; }
        .btn-icon-warn { background: #d97706; color: white; }
        .btn-icon-dark { background: #3d2b25; color: white; }
        /* Scrollbar */
        .prb-sidebar-list::-webkit-scrollbar,
        .prb-canvas::-webkit-scrollbar { width: 5px; height: 5px; }
        .prb-sidebar-list::-webkit-scrollbar-track,
        .prb-canvas::-webkit-scrollbar-track { background: transparent; }
        .prb-sidebar-list::-webkit-scrollbar-thumb,
        .prb-canvas::-webkit-scrollbar-thumb { background: #dcc9bf; border-radius: 10px; }
      `}</style>
    </div>

    {/* Modals rendered via portal directly into <body> so Bootstrap z-index/pointer-events work correctly */}
    {createPortal(
      <>
        <TableModal
          editingTable={editingTable}
          newTable={newTable}
          setEditingTable={setEditingTable}
          setNewTable={setNewTable}
          onSubmit={handleSaveTable}
          layoutId={activeLayoutId}
        />
        <BulkTableModal onBulkCreate={handleBulkCreate} />
        <LayoutModal
          layouts={layouts}
          activeLayoutId={activeLayoutId}
          onSelect={switchLayout}
          onCreate={handleCreateLayout}
          onRename={handleRenameLayout}
          onDelete={handleDeleteLayout}
        />
      </>,
      document.body
    )}
    </>
  );
}

export default PlaceReservationBoard;
