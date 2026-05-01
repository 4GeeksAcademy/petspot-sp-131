import { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const DAYS_OF_WEEK = [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" },
    { id: 5, name: "Saturday" },
    { id: 6, name: "Sunday" }
];

function PlaceScheduleManager({ placeId }) {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSchedule() {
            try {
                const response = await fetch(`${backendUrl}/api/places/${placeId}/schedule`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Map data to the 7 days
                    const fullSchedule = DAYS_OF_WEEK.map(day => {
                        const existing = data.find(d => d.day_of_week === day.id);
                        return {
                            day_of_week: day.id,
                            name: day.name,
                            start_time: existing?.start_time ? existing.start_time.substring(0, 5) : "",
                            end_time: existing?.end_time ? existing.end_time.substring(0, 5) : "",
                            is_closed: existing?.is_closed ?? true
                        };
                    });
                    
                    setSchedule(fullSchedule);
                }
            } catch (error) {
                console.error("Error fetching schedule", error);
            } finally {
                setLoading(false);
            }
        }
        
        if (placeId) {
            fetchSchedule();
        }
    }, [placeId]);

    const handleToggleClosed = (index) => {
        const newSchedule = [...schedule];
        newSchedule[index].is_closed = !newSchedule[index].is_closed;
        setSchedule(newSchedule);
    };

    const handleTimeChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/places/${placeId}/schedule`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(schedule)
            });

            if (response.ok) {
                alert("Schedule saved successfully!");
            } else {
                alert("Failed to save schedule.");
            }
        } catch (error) {
            alert("Error saving schedule.");
        }
    };

    if (loading) return <div>Loading schedule...</div>;

    return (
        <div className="card shadow-lg border-0 mb-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(240,240,245,0.9))", backdropFilter: "blur(10px)", borderRadius: "15px" }}>
            <div className="card-header bg-transparent border-0 py-4 text-center">
                <h4 className="mb-0 fw-bold" style={{ color: "#2C3E50" }}>
                    <i className="fa-solid fa-clock me-2 text-primary"></i> Weekly Schedule
                </h4>
                <p className="text-muted small mt-2 mb-0">Set your opening hours to allow users to book reservations.</p>
            </div>
            <div className="card-body px-4 pb-4">
                <div className="d-flex flex-column gap-3">
                    {schedule.map((day, index) => (
                        <div key={day.day_of_week} className="p-3 bg-white shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ borderRadius: "12px", borderLeft: !day.is_closed ? "5px solid #198754" : "5px solid #dc3545", transition: "all 0.3s ease" }}>
                            <div style={{ minWidth: '110px' }}>
                                <strong style={{ fontSize: "1.1rem", color: !day.is_closed ? "#2C3E50" : "#6c757d" }}>{day.name}</strong>
                            </div>
                            
                            <div className="form-check form-switch fs-5 mb-0" style={{ minWidth: '100px' }}>
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    role="switch"
                                    checked={!day.is_closed}
                                    onChange={() => handleToggleClosed(index)}
                                    style={{ cursor: "pointer" }}
                                />
                                <label className="form-check-label ms-2 fs-6 mt-1" style={{ color: !day.is_closed ? "#198754" : "#dc3545", fontWeight: "600" }}>
                                    {day.is_closed ? "Closed" : "Open"}
                                </label>
                            </div>
                            
                            <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end" style={{ opacity: day.is_closed ? 0.4 : 1, transition: "opacity 0.3s" }}>
                                <div className="input-group" style={{ maxWidth: '140px' }}>
                                    <span className="input-group-text bg-light border-end-0"><i className="fa-regular fa-clock"></i></span>
                                    <input 
                                        type="time" 
                                        className="form-control border-start-0 ps-0 fw-semibold"
                                        value={day.start_time}
                                        onChange={(e) => handleTimeChange(index, "start_time", e.target.value)}
                                        disabled={day.is_closed}
                                        style={{ color: "#495057" }}
                                    />
                                </div>
                                <span className="fw-bold text-muted mx-1">to</span>
                                <div className="input-group" style={{ maxWidth: '140px' }}>
                                    <span className="input-group-text bg-light border-end-0"><i className="fa-regular fa-clock"></i></span>
                                    <input 
                                        type="time" 
                                        className="form-control border-start-0 ps-0 fw-semibold"
                                        value={day.end_time}
                                        onChange={(e) => handleTimeChange(index, "end_time", e.target.value)}
                                        disabled={day.is_closed}
                                        style={{ color: "#495057" }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-5">
                    <button className="btn btn-primary px-5 py-2 fw-bold" onClick={handleSave} style={{ borderRadius: "30px", background: "linear-gradient(45deg, #0d6efd, #0dcaf0)", border: "none", boxShadow: "0 4px 15px rgba(13, 110, 253, 0.3)" }}>
                        <i className="fa-solid fa-save me-2"></i> Save Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlaceScheduleManager;
