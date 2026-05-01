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

  const style = {
    minHeight: "150px",
    border: isOver ? "2px dashed #0d6efd" : "1px solid #dee2e6",
    backgroundColor: isOver ? "#f8f9fa" : "#ffffff",
    borderRadius: "8px",
    padding: "10px",
    margin: "10px",
    position: "relative"
  };

  return (
    <div ref={setNodeRef} style={style} className="shadow-sm">
      <h6 className="border-bottom pb-2 mb-2 text-primary">
        <i className="fas fa-utensils me-2"></i>{table.name}
      </h6>
      <div className="small text-muted mb-2">
        <i className="fas fa-users me-1"></i> {table.capacity_people} ppl | <i className="fas fa-paw me-1"></i> {table.capacity_pets} pets
      </div>
      {children}
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
    zIndex: 999,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card border-0 shadow-sm mb-2 ${isDragging ? 'opacity-50' : ''} ${reservation.status === 'confirmed' ? 'bg-success-subtle' : 'bg-warning-subtle'}`}
      style={{ ...style, cursor: "grab" }}
    >
      <div className="card-body p-2">
        <div className="fw-bold small">{reservation.user_name}</div>
        <div className="small text-muted">
           {reservation.reservation_time.substring(0,5)} | <i className="fas fa-users"></i> {reservation.people_count}
           {reservation.pet_id && <span> | <i className="fas fa-paw"></i> 1</span>}
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
        // Fetch Tables
        const resTables = await fetch(`${backendUrl}/api/places/${placeId}/tables`);
        if (resTables.ok) {
            setTables(await resTables.json());
        }

        // Fetch Reservations
        const resReservations = await fetch(`${backendUrl}/api/places/${placeId}/reservations`);
        if (resReservations.ok) {
            setReservations(await resReservations.json());
        }
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
      if(!confirm("Are you sure you want to delete this table?")) return;
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
        
        if (res.ok) {
            fetchData();
        } else {
            alert("Failed to seat reservation");
        }
      } catch (error) {
          console.error("Error seating reservation", error);
      }
    }
  };

  if (loading) return <div className="text-center p-5">Loading board...</div>;

  // Group reservations
  const unseatedReservations = reservations.filter(r => !r.table_id);
  const seatedReservations = reservations.filter(r => r.table_id);

  return (
    <div className="container-fluid mt-4">
      <h3 className="mb-4">Reservation Board & Table Management</h3>
      
      <div className="row mb-4">
          <div className="col-12">
              <div className="card shadow-sm border-0">
                  <div className="card-header bg-white">
                      <h5 className="mb-0">Add New Table</h5>
                  </div>
                  <div className="card-body">
                      <form className="row g-3 align-items-end" onSubmit={handleAddTable}>
                          <div className="col-md-4">
                              <label className="form-label">Table Name (e.g. T1)</label>
                              <input type="text" className="form-control" value={newTableName} onChange={e => setNewTableName(e.target.value)} required />
                          </div>
                          <div className="col-md-3">
                              <label className="form-label">People Capacity</label>
                              <input type="number" className="form-control" value={newTableCapPeople} onChange={e => setNewTableCapPeople(e.target.value)} min="1" required />
                          </div>
                          <div className="col-md-3">
                              <label className="form-label">Pet Capacity</label>
                              <input type="number" className="form-control" value={newTableCapPets} onChange={e => setNewTableCapPets(e.target.value)} min="0" required />
                          </div>
                          <div className="col-md-2">
                              <button type="submit" className="btn btn-primary w-100">Add Table</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="row">
          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100 bg-light">
              <div className="card-header bg-white">
                <h5 className="mb-0">Pending / Unseated</h5>
              </div>
              <div className="card-body" style={{ minHeight: "400px", overflowY: "auto" }}>
                {unseatedReservations.length === 0 ? (
                  <p className="text-muted small">No pending reservations.</p>
                ) : (
                  unseatedReservations.map(res => (
                    <DraggableReservation key={res.id} reservation={res} />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white">
                <h5 className="mb-0">Floor Plan / Tables</h5>
              </div>
              <div className="card-body p-2">
                <div className="row g-2">
                  {tables.map(table => {
                    const tableReservations = seatedReservations.filter(r => r.table_id === table.id);
                    return (
                      <div className="col-md-4" key={table.id}>
                        <DroppableTable table={table}>
                            {tableReservations.map(res => (
                                <DraggableReservation key={res.id} reservation={res} />
                            ))}
                            <button 
                                className="btn btn-sm btn-outline-danger position-absolute" 
                                style={{ top: "5px", right: "5px", padding: "0 4px" }}
                                onClick={() => handleDeleteTable(table.id)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </DroppableTable>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default PlaceReservationBoard;
