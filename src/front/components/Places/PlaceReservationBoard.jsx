import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// --- COMPONENTES AUXILIARES ---

function TableFurniture({ table, reservations, onDelete, onEdit, onToggleOccupied, children }) {
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
    width: "150px",
    height: "150px",
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
    transition: isDragging ? "none" : "all 0.2s ease",
  };

  const shapeStyle = table.shape === "round" ? { borderRadius: "50%" } : { borderRadius: "18px" };
  const isOccupiedManual = table.is_occupied;
  const hasReservations = reservations.length > 0;

  let bgColor = "rgba(25, 135, 84, 0.9)"; // Verde
  if (isOccupiedManual) bgColor = "rgba(220, 53, 69, 0.9)"; // Rojo
  else if (hasReservations) bgColor = "rgba(13, 110, 253, 0.9)"; // Azul

  return (
    <div ref={setDragRef} style={style} className="furniture-wrapper">
      <div 
        ref={setDropRef}
        {...attributes}
        {...listeners}
        className="d-flex flex-column align-items-center justify-content-center shadow border-2 position-relative h-100 w-100"
        style={{
          ...shapeStyle,
          background: isOver ? "rgba(255, 255, 255, 0.4)" : bgColor,
          backdropFilter: "blur(10px)",
          border: isOver ? "2px dashed white" : "2px solid rgba(255,255,255,0.2)",
          cursor: "grab", color: "white"
        }}
      >
        <div className="fw-bold small">{table.name}</div>
        <div className="small opacity-75" style={{fontSize: "0.7rem"}}>
            <i className="fas fa-users me-1"></i>{table.capacity_people} 
            <i className="fas fa-paw ms-2 me-1"></i>{table.capacity_pets}
        </div>

        {/* Action Menu */}
        <div className="position-absolute top-0 end-0 p-1 d-flex flex-column gap-1 action-buttons">
            <button className="btn btn-sm btn-light p-1 rounded-circle" style={{width: "20px", height: "20px", fontSize: "0.6rem"}} onClick={(e) => { e.stopPropagation(); onEdit(table); }}><i className="fas fa-pencil"></i></button>
            <button className="btn btn-sm btn-dark p-1 rounded-circle" style={{width: "20px", height: "20px", fontSize: "0.6rem"}} onClick={(e) => { e.stopPropagation(); onDelete(table.id); }}><i className="fas fa-times"></i></button>
            <button className={`btn btn-sm ${isOccupiedManual ? 'btn-warning' : 'btn-danger'} p-1 rounded-circle`} style={{width: "20px", height: "20px", fontSize: "0.6rem"}} onClick={(e) => { e.stopPropagation(); onToggleOccupied(table); }}><i className="fas fa-user-slash"></i></button>
        </div>
      </div>
      <div className="seated-content mt-1">{children}</div>
      <style>{`.furniture-wrapper:hover .action-buttons { opacity: 1; } .action-buttons { opacity: 0; transition: 0.2s; }`}</style>
    </div>
  );
}

function DraggableReservation({ reservation, onUpdateStatus, isSmall = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `res-${reservation.id}`,
    data: { type: "reservation", reservation }
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 9999 } : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`card border-0 shadow-sm mb-2 ${isDragging ? 'opacity-50' : ''}`}
      style={{ 
        ...style, borderRadius: "12px", background: "white", touchAction: "none",
        fontSize: isSmall ? "0.7rem" : "0.85rem",
        borderLeft: `5px solid ${reservation.status === 'confirmed' ? '#198754' : '#ffc107'}`
      }}
    >
      <div className={`card-body ${isSmall ? 'p-1 px-2' : 'p-2 px-3'}`}>
        <div className="d-flex justify-content-between align-items-center">
            <div {...listeners} {...attributes} style={{cursor: "grab"}} className="flex-grow-1 overflow-hidden">
                <div className="fw-bold text-truncate">{reservation.user_name || "Guest"}</div>
                <div className="small text-muted">{reservation.reservation_time.substring(0,5)}</div>
            </div>
            {!isSmall && (
                <div className="d-flex gap-1">
                    <button className="btn btn-xs btn-outline-danger" onClick={() => onUpdateStatus(reservation.id, 'cancelled')}><i className="fas fa-times"></i></button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

function PlaceReservationBoard({ placeId }) {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({ name: "", capacity_people: 2, capacity_pets: 1, shape: "square" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token_place");
    if (!token) return;
    try {
        setLoading(true);
        console.log(`Fetching data for date: ${selectedDate}`);
        
        const [resT, resR] = await Promise.all([
            fetch(`${backendUrl}/api/places/${placeId}/tables`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${backendUrl}/api/places/private/reservations?date=${selectedDate}`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (resT.ok) {
            const tData = await resT.json();
            setTables(tData);
            console.log("Tables loaded:", tData.length);
        } else {
            console.error("Failed to load tables", resT.status);
        }

        if (resR.ok) {
            const rData = await resR.json();
            setReservations(Array.isArray(rData) ? rData : []);
            console.log("Reservations loaded:", Array.isArray(rData) ? rData.length : 0);
        } else {
            console.error("Failed to load reservations", resR.status);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    } finally {
        setLoading(false);
    }
  }, [placeId, selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const token = localStorage.getItem("token_place");

    // Caso A: Sentar reserva en mesa
    if (active.data.current.type === "reservation" && over.data.current?.type === "table") {
        const resId = active.data.current.reservation.id;
        const tableId = over.data.current.table.id;
        await fetch(`${backendUrl}/api/reservations/${resId}/seat`, {
            method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ table_id: tableId, status: 'confirmed' })
        });
        fetchData();
    }

    // Caso B: Mover mesa de sitio
    if (active.data.current.type === "furniture") {
        const table = active.data.current.table;
        const newX = table.pos_x + event.delta.x;
        const newY = table.pos_y + event.delta.y;
        await fetch(`${backendUrl}/api/tables/${table.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ pos_x: Math.round(newX), pos_y: Math.round(newY) })
        });
        fetchData();
    }
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token_place");
    const payload = editingTable || { ...newTable, pos_x: 50, pos_y: 50 };
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
        const closeBtn = document.querySelector('[data-bs-dismiss="modal"]');
        if (closeBtn) closeBtn.click();
    } else {
        const err = await res.json();
        alert("Error: " + (err.msg || err.response || "Unknown error"));
    }
  };

  const onUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token_place");
    await fetch(`${backendUrl}/api/reservations/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status })
    });
    fetchData();
  };

  if (loading && tables.length === 0) return <div className="text-center p-5"><div className="spinner-border text-primary"></div><p>Loading layout...</p></div>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="container-fluid p-4" style={{ background: "rgba(255,255,255,0.4)", borderRadius: "24px", minHeight: "85vh" }}>
        <div className="row g-4 h-100">
            {/* Sidebar Waitlist */}
            <div className="col-lg-3 border-end">
                <div className="mb-4">
                    <label className="small fw-bold text-muted text-uppercase mb-2 d-block">Planning Date</label>
                    <input type="date" className="form-control rounded-pill border-0 shadow-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
                
                <h5 className="fw-bold mb-3"><i className="fas fa-list-ul me-2 text-primary"></i>Waitlist</h5>
                <div className="waitlist-scroll pe-2" style={{maxHeight: "65vh", overflowY: "auto"}}>
                    {reservations.filter(r => !r.table_id && r.status !== 'cancelled').map(res => (
                        <DraggableReservation key={res.id} reservation={res} onUpdateStatus={onUpdateStatus} />
                    ))}
                    {reservations.filter(r => !r.table_id && r.status !== 'cancelled').length === 0 && (
                        <div className="text-center py-5 opacity-50"><p className="small">No pending reservations for this day</p></div>
                    )}
                </div>
            </div>

            {/* Floor Plan Designer */}
            <div className="col-lg-9 position-relative">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0"><i className="fas fa-th me-2 text-primary"></i>Establishment Map</h5>
                    <button className="btn btn-primary rounded-pill px-4" onClick={() => setEditingTable(null)} data-bs-toggle="modal" data-bs-target="#tableModal">
                        <i className="fas fa-plus me-2"></i>New Table
                    </button>
                </div>

                <div className="floor-plan-area rounded-4 shadow-inner position-relative overflow-hidden" style={{ height: "70vh", background: "#fff", backgroundImage: "radial-gradient(#eee 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                    {tables.map(table => (
                        <TableFurniture 
                            key={table.id} 
                            table={table} 
                            reservations={reservations.filter(r => r.table_id === table.id)}
                            onDelete={async (id) => { if(confirm("Delete table?")) { await fetch(`${backendUrl}/api/tables/${id}`, { method: 'DELETE', headers: { "Authorization": `Bearer ${localStorage.getItem("token_place")}` } }); fetchData(); } }}
                            onEdit={(t) => setEditingTable(t)}
                            onToggleOccupied={async (t) => { await fetch(`${backendUrl}/api/tables/${t.id}`, { method: 'PUT', headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token_place")}` }, body: JSON.stringify({ is_occupied: !t.is_occupied }) }); fetchData(); }}
                        >
                            {reservations.filter(r => r.table_id === table.id).map(res => (
                                <DraggableReservation key={res.id} reservation={res} onUpdateStatus={onUpdateStatus} isSmall={true} />
                            ))}
                        </TableFurniture>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Modal Reutilizable */}
      <div className="modal fade" id="tableModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{borderRadius: "20px"}}>
            <form onSubmit={handleSaveTable}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">{editingTable ? "Edit Table" : "Create New Table"}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">NAME / NUMBER</label>
                  <input type="text" className="form-control rounded-3" value={editingTable ? editingTable.name : newTable.name} onChange={e => editingTable ? setEditingTable({...editingTable, name: e.target.value}) : setNewTable({...newTable, name: e.target.value})} required />
                </div>
                <div className="row g-3">
                    <div className="col-6">
                        <label className="form-label small fw-bold">GUESTS</label>
                        <input type="number" className="form-control rounded-3" value={editingTable ? editingTable.capacity_people : newTable.capacity_people} onChange={e => editingTable ? setEditingTable({...editingTable, capacity_people: e.target.value}) : setNewTable({...newTable, capacity_people: e.target.value})} />
                    </div>
                    <div className="col-6">
                        <label className="form-label small fw-bold">PETS</label>
                        <input type="number" className="form-control rounded-3" value={editingTable ? editingTable.capacity_pets : newTable.capacity_pets} onChange={e => editingTable ? setEditingTable({...editingTable, capacity_pets: e.target.value}) : setNewTable({...newTable, capacity_pets: e.target.value})} />
                    </div>
                </div>
                <div className="mt-3">
                    <label className="form-label small fw-bold">SHAPE</label>
                    <div className="d-flex gap-2">
                        <button type="button" className={`btn flex-grow-1 ${ (editingTable ? editingTable.shape : newTable.shape) === 'square' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => editingTable ? setEditingTable({...editingTable, shape: 'square'}) : setNewTable({...newTable, shape: 'square'})}>Square</button>
                        <button type="button" className={`btn flex-grow-1 ${ (editingTable ? editingTable.shape : newTable.shape) === 'round' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => editingTable ? setEditingTable({...editingTable, shape: 'round'}) : setNewTable({...newTable, shape: 'round'})}>Round</button>
                    </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm">CONFIRM TABLE</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default PlaceReservationBoard;
