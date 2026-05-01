import { useState, useEffect } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Componente Mesa (Arrastrable y permite soltar reservas)
function TableFurniture({ table, reservations, onDelete, onEdit, onMove, children }) {
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `table-drop-${table.id}`,
    data: { type: "table", table }
  });

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `table-drag-${table.id}`,
    data: { type: "furniture", table }
  });

  const style = {
    position: "absolute",
    left: `${table.pos_x}px`,
    top: `${table.pos_y}px`,
    width: "140px",
    height: "140px",
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
    transition: isDragging ? "none" : "all 0.2s ease",
  };

  const shapeStyle = table.shape === "round" ? { borderRadius: "50%" } : { borderRadius: "16px" };
  const hasReservations = reservations.length > 0;
  const isOccupiedManual = table.is_occupied;

  let bgColor = "rgba(25, 135, 84, 0.95)"; // Verde (Libre)
  let borderColor = "rgba(25, 135, 84, 0.2)";
  let glowColor = "rgba(25, 135, 84, 0.3)";

  if (isOccupiedManual) {
    bgColor = "rgba(220, 53, 69, 0.95)"; // Rojo (Ocupado Manual)
    borderColor = "rgba(220, 53, 69, 0.5)";
    glowColor = "rgba(220, 53, 69, 0.4)";
  } else if (hasReservations) {
    bgColor = "rgba(13, 110, 253, 0.95)"; // Azul (Con Reserva)
    borderColor = "rgba(13, 110, 253, 0.5)";
    glowColor = "rgba(13, 110, 253, 0.4)";
  }

  return (
    <div ref={setDragRef} style={style} className={`furniture-container ${isDragging ? "dragging" : ""}`}>
      <div 
        ref={setDropRef}
        {...attributes}
        {...listeners}
        className={`d-flex flex-column align-items-center justify-content-center shadow-lg border-2 transition-all position-relative`}
        style={{
          width: "100%", height: "100%", ...shapeStyle,
          background: isOver ? "rgba(255, 255, 255, 0.3)" : bgColor,
          backdropFilter: "blur(10px)",
          border: isOver ? "2px dashed white" : `2px solid ${borderColor}`,
          boxShadow: `0 0 20px ${glowColor}`,
          cursor: "grab", color: "white"
        }}
      >
        <div className="text-center px-2">
            <div className="fw-bold small mb-1 text-truncate" style={{maxWidth: "100px"}}>{table.name}</div>
            <div className="d-flex gap-1 justify-content-center align-items-center opacity-75">
                <span className="small" style={{fontSize: "0.65rem"}}><i className="fas fa-users me-1"></i>{table.capacity_people}</span>
                <span className="small" style={{fontSize: "0.65rem"}}><i className="fas fa-paw me-1"></i>{table.capacity_pets}</span>
            </div>
        </div>

        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1">
            {reservations.map(res => (
                <div key={res.id} className="bg-success rounded-circle shadow-sm" style={{width: "8px", height: "8px"}} title={res.user_name}></div>
            ))}
        </div>

        <div className="table-actions position-absolute top-0 end-0 m-1 d-flex flex-column gap-1 opacity-0 transition-all">
            <button className="btn btn-xs btn-light rounded-circle p-1" onClick={(e) => { e.stopPropagation(); onEdit(table); }} title="Edit">
                <i className="fas fa-pencil-alt" style={{fontSize: "0.6rem"}}></i>
            </button>
            <button className={`btn btn-xs ${table.is_occupied ? 'btn-warning' : 'btn-danger'} rounded-circle p-1`} onClick={(e) => { e.stopPropagation(); onMove(table.id, { is_occupied: !table.is_occupied }); }} title={table.is_occupied ? "Mark Available" : "Mark Occupied"}>
                <i className={`fas ${table.is_occupied ? 'fa-door-open' : 'fa-user-slash'}`} style={{fontSize: "0.6rem"}}></i>
            </button>
            <button className="btn btn-xs btn-dark rounded-circle p-1" onClick={(e) => { e.stopPropagation(); onDelete(table.id); }} title="Delete">
                <i className="fas fa-times" style={{fontSize: "0.6rem"}}></i>
            </button>
        </div>
      </div>
      <div className="seated-reservations mt-2" style={{pointerEvents: "auto"}}>{children}</div>
      <style>{`.furniture-container:hover .table-actions { opacity: 1 !important; } .btn-xs { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }`}</style>
    </div>
  );
}

// Componente Reserva Arrastrable
function DraggableReservation({ reservation, onUpdateStatus }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `res-${reservation.id}`,
    data: { type: "reservation", reservation }
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 9999 } : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`card border-0 shadow-sm mb-2 transition-all ${isDragging ? 'shadow-lg scale-105' : ''}`}
      style={{ 
        ...style, borderRadius: "15px", background: "white", width: "100%", touchAction: "none",
        borderLeft: reservation.status === 'confirmed' ? "5px solid #198754" : (reservation.status === 'cancelled' ? "5px solid #dc3545" : "5px solid #0d6efd"),
      }}
    >
      <div className="card-body p-2 px-3">
        <div className="d-flex justify-content-between align-items-start">
            <div className="overflow-hidden flex-grow-1" {...listeners} {...attributes} style={{cursor: "grab"}}>
                <div className="fw-bold text-truncate" style={{ fontSize: "0.85rem" }}>{reservation.user_name || "Guest"}</div>
                <div className="d-flex gap-2 align-items-center mt-1">
                    <span className="badge bg-primary-subtle text-primary rounded-pill" style={{fontSize: "0.65rem"}}>{reservation.reservation_time.substring(0,5)}</span>
                    <span className={`badge rounded-pill text-uppercase ${reservation.status === 'confirmed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{fontSize: "0.6rem"}}>{reservation.status}</span>
                </div>
            </div>
            <div className="d-flex flex-column gap-1 ms-2">
                {reservation.status !== 'confirmed' && (
                    <button className="btn btn-sm btn-success p-1 rounded-circle" onClick={() => onUpdateStatus(reservation.id, 'confirmed')}><i className="fas fa-check" style={{fontSize: "0.7rem"}}></i></button>
                )}
                <button className="btn btn-sm btn-outline-danger p-1 rounded-circle" onClick={() => onUpdateStatus(reservation.id, 'cancelled')}><i className="fas fa-times" style={{fontSize: "0.7rem"}}></i></button>
            </div>
        </div>
      </div>
    </div>
  );
}

function PlaceReservationBoard({ placeId }) {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({ name: "", capacity_people: 2, capacity_pets: 1, shape: "square" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchData = async () => {
    try {
        setLoading(true);
        const [resT, resR] = await Promise.all([
            fetch(`${backendUrl}/api/places/${placeId}/tables`),
            fetch(`${backendUrl}/api/places/${placeId}/reservations?date=${selectedDate}`)
        ]);
        if (resT.ok) setTables(await resT.json());
        if (resR.ok) setReservations(await resR.json());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (placeId) fetchData(); }, [placeId, selectedDate]);

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token_place");
    const res = await fetch(`${backendUrl}/api/reservations/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const token = localStorage.getItem("token_place");

    if (active.data.current.type === "reservation" && over.data.current?.type === "table") {
      await fetch(`${backendUrl}/api/reservations/${active.data.current.reservation.id}/seat`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table_id: over.data.current.table.id, status: 'confirmed' })
      });
      fetchData();
    }

    if (active.data.current.type === "furniture") {
      const table = active.data.current.table;
      await fetch(`${backendUrl}/api/tables/${table.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ pos_x: Math.round(table.pos_x + event.delta.x), pos_y: Math.round(table.pos_y + event.delta.y) })
      });
      fetchData();
    }
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token_place");
    const payload = editingTable || newTable;
    const url = editingTable ? `${backendUrl}/api/tables/${editingTable.id}` : `${backendUrl}/api/places/${placeId}/tables`;
    
    const res = await fetch(url, {
      method: editingTable ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
        setEditingTable(null);
        setNewTable({ name: "", capacity_people: 2, capacity_pets: 1, shape: "square" });
        fetchData();
        // Cerrar modal de Bootstrap manualmente si es necesario
        const modal = document.getElementById('tableModal');
        const modalInstance = window.bootstrap?.Modal.getInstance(modal);
        modalInstance?.hide();
    } else {
        const error = await res.json();
        alert(error.msg || "Error saving table");
    }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm("Delete this table?")) return;
    const token = localStorage.getItem("token_place");
    await fetch(`${backendUrl}/api/tables/${id}`, { 
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="board-wrapper min-vh-100 p-3 p-md-5" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", borderRadius: "30px" }}>
      <div className="container-fluid">
        <div className="row g-4">
          {/* Waitlist */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "24px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)" }}>
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <input type="date" className="form-control border-0 shadow-sm rounded-pill mb-3" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                <h5 className="fw-bold mb-0">Waitlist</h5>
              </div>
              <div className="card-body p-3 overflow-auto" style={{ maxHeight: "70vh" }}>
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    {reservations.filter(r => !r.table_id && r.status !== 'cancelled').map(res => (
                        <DraggableReservation key={res.id} reservation={res} onUpdateStatus={handleUpdateStatus} />
                    ))}
                    {reservations.filter(r => !r.table_id && r.status !== 'cancelled').length === 0 && (
                        <div className="text-center py-5 opacity-50"><i className="fas fa-calendar-day fa-3x mb-2"></i><p>No reservations</p></div>
                    )}
                </DndContext>
              </div>
            </div>
          </div>

          {/* Floor Plan */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-lg position-relative" style={{ borderRadius: "24px", height: "85vh", background: "rgba(255,255,255,0.6)" }}>
              <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{borderRadius: "24px 24px 0 0"}}>
                <h5 className="fw-bold mb-0">Room Layout</h5>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => { setEditingTable(null); setNewTable({ name: "", capacity_people: 2, capacity_pets: 1, shape: "square" }); }} data-bs-toggle="modal" data-bs-target="#tableModal">
                    <i className="fas fa-plus me-2"></i>New Table
                </button>
              </div>
              <div className="floor-canvas flex-grow-1 overflow-hidden" style={{ backgroundImage: "radial-gradient(#d1d1d1 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
                <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                    {tables.map(table => (
                        <TableFurniture 
                            key={table.id} table={table} onDelete={handleDeleteTable} onEdit={(t) => setEditingTable(t)} onMove={async (id, data) => {
                                const token = localStorage.getItem("token_place");
                                await fetch(`${backendUrl}/api/tables/${id}`, {
                                    method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                    body: JSON.stringify(data)
                                });
                                fetchData();
                            }}
                            reservations={reservations.filter(r => r.table_id === table.id)}
                        >
                            {reservations.filter(r => r.table_id === table.id).map(res => (
                                <DraggableReservation key={res.id} reservation={res} onUpdateStatus={handleUpdateStatus} />
                            ))}
                        </TableFurniture>
                    ))}
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="modal fade" id="tableModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{borderRadius: "20px"}}>
            <form onSubmit={handleSaveTable}>
              <div className="modal-header border-0">
                <h5 className="fw-bold">{editingTable ? "Edit Table" : "New Table"}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">NAME / NUMBER</label>
                  <input type="text" className="form-control rounded-3" value={editingTable ? editingTable.name : newTable.name} onChange={e => editingTable ? setEditingTable({...editingTable, name: e.target.value}) : setNewTable({...newTable, name: e.target.value})} required placeholder="Table 1" />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted">GUESTS</label>
                    <input type="number" className="form-control rounded-3" value={editingTable ? editingTable.capacity_people : newTable.capacity_people} onChange={e => editingTable ? setEditingTable({...editingTable, capacity_people: e.target.value}) : setNewTable({...newTable, capacity_people: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted">PETS</label>
                    <input type="number" className="form-control rounded-3" value={editingTable ? editingTable.capacity_pets : newTable.capacity_pets} onChange={e => editingTable ? setEditingTable({...editingTable, capacity_pets: e.target.value}) : setNewTable({...newTable, capacity_pets: e.target.value})} />
                  </div>
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Shape</label>
                    <div className="d-flex gap-3">
                        <button type="button" className={`btn flex-grow-1 rounded-3 ${ (editingTable ? editingTable.shape : newTable.shape) === 'square' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => editingTable ? setEditingTable({...editingTable, shape: 'square'}) : setNewTable({...newTable, shape: 'square'})}>Square</button>
                        <button type="button" className={`btn flex-grow-1 rounded-3 ${ (editingTable ? editingTable.shape : newTable.shape) === 'round' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => editingTable ? setEditingTable({...editingTable, shape: 'round'}) : setNewTable({...newTable, shape: 'round'})}>Round</button>
                    </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold" data-bs-dismiss="modal">SAVE TABLE</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceReservationBoard;
