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

// Droppable Table Component
function DroppableTable({ table, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `table-${table.id}`,
    data: { table }
  });

  return (
    <div 
      ref={setNodeRef} 
      className="position-relative shadow-sm transition-all" 
      style={{
        minHeight: "180px",
        background: isOver ? "rgba(13, 110, 253, 0.1)" : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        border: isOver ? "2px dashed #0d6efd" : "1px solid rgba(0,0,0,0.05)",
        borderRadius: "20px",
        padding: "15px",
        transition: "all 0.2s ease"
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
          <i className="fas fa-couch me-2 text-primary"></i>{table.name}
        </h6>
        <span className="badge rounded-pill bg-light text-dark border shadow-sm small px-2 py-1">
          <i className="fas fa-users me-1 text-primary"></i>{table.capacity_people} | <i className="fas fa-paw me-1 text-success"></i>{table.capacity_pets}
        </span>
      </div>
      <div className="d-flex flex-column gap-2 mt-3">
        {children}
      </div>
    </div>
  );
}

// Draggable Reservation Component
function DraggableReservation({ reservation }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `res-${reservation.id}`,
    data: { reservation }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 9999,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card border-0 shadow-sm transition-all ${isDragging ? 'shadow-lg rotate-1' : ''}`}
      style={{ 
        ...style, 
        cursor: "grab",
        borderRadius: "12px",
        background: reservation.status === 'confirmed' ? "linear-gradient(45deg, #ffffff, #f0fff0)" : "linear-gradient(45deg, #ffffff, #fffdf0)",
        borderLeft: reservation.status === 'confirmed' ? "4px solid #198754" : "4px solid #ffc107",
        width: "100%",
        touchAction: "none"
      }}
    >
      <div className="card-body p-2 d-flex justify-content-between align-items-center">
        <div className="overflow-hidden">
          <div className="fw-bold text-truncate" style={{ fontSize: "0.85rem" }}>{reservation.user_name || "Guest User"}</div>
          <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
             <i className="far fa-clock me-1"></i>{reservation.reservation_time.substring(0,5)}
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
            <span className="badge bg-primary-subtle text-primary rounded-pill border-0" style={{ fontSize: "0.65rem" }}>
                <i className="fas fa-user me-1"></i>{reservation.people_count}
            </span>
            {reservation.pet_id && (
                <span className="badge bg-success-subtle text-success rounded-pill border-0 mt-1" style={{ fontSize: "0.65rem" }}>
                    <i className="fas fa-paw"></i>
                </span>
            )}
        </div>
      </div>
    </div>
  );
}

function PlaceReservationBoard({ placeId }) {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // For building new tables
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapPeople, setNewTableCapPeople] = useState(2);
  const [newTableCapPets, setNewTableCapPets] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (placeId) {
      fetchData();
    }
  }, [placeId]);

  const fetchData = async () => {
    try {
        setLoading(true);
        const resTables = await fetch(`${backendUrl}/api/places/${placeId}/tables`);
        if (resTables.ok) setTables(await resTables.json());

        const resReservations = await fetch(`${backendUrl}/api/places/${placeId}/reservations`);
        if (resReservations.ok) setReservations(await resReservations.json());
    } catch (error) {
        console.error("Error fetching board data", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`${backendUrl}/api/places/${placeId}/tables`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: newTableName,
                  capacity_people: newTableCapPeople,
                  capacity_pets: newTableCapPets,
                  pos_x: 0,
                  pos_y: 0
              })
          });
          if (res.ok) {
              setNewTableName("");
              fetchData();
          }
      } catch (error) {
          console.error("Error adding table", error);
      }
  };

  const handleDeleteTable = async (tableId) => {
      if(!confirm("Delete this table? Any seated reservations will be unseated.")) return;
      try {
          const res = await fetch(`${backendUrl}/api/tables/${tableId}`, { method: 'DELETE' });
          if (res.ok) fetchData();
      } catch(error) {
          console.error("Error deleting table", error);
      }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith("table-")) {
      const reservationId = active.data.current.reservation.id;
      const tableId = over.data.current.table.id;
      try {
        const res = await fetch(`${backendUrl}/api/reservations/${reservationId}/seat`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table_id: tableId })
        });
        if (res.ok) fetchData();
      } catch (error) {
          console.error("Error seating reservation", error);
      }
    }
  };

  if (loading) return <div className="text-center p-5 fw-bold text-muted"><i className="fas fa-spinner fa-spin me-2"></i>Loading Board...</div>;

  const unseatedReservations = reservations.filter(r => !r.table_id);
  const seatedReservations = reservations.filter(r => r.table_id);

  return (
    <div className="container-fluid py-4 min-vh-100" style={{ background: "#f8f9fa" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
            <i className="fas fa-map-marker-alt me-3 text-primary"></i>Establishment Floor Plan
          </h2>
          <div className="text-muted small">
              <i className="fas fa-info-circle me-1"></i> Drag reservations from the left to seat them at tables.
          </div>
      </div>
      
      <div className="row mb-5">
          <div className="col-12">
              <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
                  <div className="card-header bg-white border-0 pt-4 px-4">
                      <h5 className="mb-0 fw-bold">Add Physical Table</h5>
                  </div>
                  <div className="card-body p-4">
                      <form className="row g-3 align-items-end" onSubmit={handleAddTable}>
                          <div className="col-md-4">
                              <label className="form-label small text-uppercase fw-bold text-muted">Table ID/Name</label>
                              <input type="text" className="form-control form-control-lg border-0 bg-light rounded-3" placeholder="e.g. Terrace-1" value={newTableName} onChange={e => setNewTableName(e.target.value)} required />
                          </div>
                          <div className="col-md-3">
                              <label className="form-label small text-uppercase fw-bold text-muted">People Cap.</label>
                              <input type="number" className="form-control form-control-lg border-0 bg-light rounded-3" value={newTableCapPeople} onChange={e => setNewTableCapPeople(e.target.value)} min="1" required />
                          </div>
                          <div className="col-md-3">
                              <label className="form-label small text-uppercase fw-bold text-muted">Pet Cap.</label>
                              <input type="number" className="form-control form-control-lg border-0 bg-light rounded-3" value={newTableCapPets} onChange={e => setNewTableCapPets(e.target.value)} min="0" required />
                          </div>
                          <div className="col-md-2">
                              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm border-0" style={{ background: "linear-gradient(45deg, #1a237e, #0d47a1)" }}>
                                <i className="fas fa-plus me-2"></i>Add
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card shadow-lg border-0 h-100 overflow-hidden" style={{ borderRadius: "20px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
              <div className="card-header border-0 py-4 px-4 bg-primary text-white text-center">
                <h5 className="mb-0 fw-bold"><i className="fas fa-clock me-2"></i>Waitlist</h5>
                <small className="opacity-75">{unseatedReservations.length} Pending</small>
              </div>
              <div className="card-body p-3 bg-light" style={{ minHeight: "500px", maxHeight: "700px", overflowY: "auto" }}>
                {unseatedReservations.length === 0 ? (
                  <div className="text-center mt-5">
                      <i className="fas fa-check-circle text-success fs-1 mb-3 opacity-25"></i>
                      <p className="text-muted fw-bold">All clear!</p>
                      <small className="text-muted">No unseated reservations</small>
                  </div>
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {unseatedReservations.map(res => (
                            <DraggableReservation key={res.id} reservation={res} />
                        ))}
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card shadow-lg border-0 h-100" style={{ borderRadius: "20px", background: "rgba(255,255,255,0.4)" }}>
              <div className="card-header bg-transparent border-0 py-4 px-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold"><i className="fas fa-chair me-2 text-primary"></i>Live Floor Plan</h5>
                    <div className="d-flex gap-3 small fw-bold">
                        <span className="text-success"><i className="fas fa-circle me-1"></i> Seated</span>
                        <span className="text-muted"><i className="fas fa-circle me-1"></i> Empty</span>
                    </div>
                </div>
              </div>
              <div className="card-body p-4 overflow-auto" style={{ maxHeight: "700px" }}>
                {tables.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="fas fa-info-circle text-muted fs-1 mb-3"></i>
                        <h5>No tables configured</h5>
                        <p className="text-muted">Use the form above to add your establishment's tables.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                    {tables.map(table => {
                        const tableReservations = seatedReservations.filter(r => r.table_id === table.id);
                        return (
                        <div className="col-lg-4 col-md-6" key={table.id}>
                            <DroppableTable table={table}>
                                {tableReservations.map(res => (
                                    <DraggableReservation key={res.id} reservation={res} />
                                ))}
                                <button 
                                    className="btn btn-sm btn-link text-danger position-absolute" 
                                    style={{ top: "10px", right: "10px", zIndex: 10 }}
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id); }}
                                    title="Delete table"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </DroppableTable>
                        </div>
                        );
                    })}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default PlaceReservationBoard;
