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
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0">Weekly Schedule</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle">
                        <tbody>
                            {schedule.map((day, index) => (
                                <tr key={day.day_of_week}>
                                    <td style={{ width: '120px' }}><strong>{day.name}</strong></td>
                                    <td style={{ width: '100px' }}>
                                        <div className="form-check form-switch">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                checked={!day.is_closed}
                                                onChange={() => handleToggleClosed(index)}
                                            />
                                            <label className="form-check-label">
                                                {day.is_closed ? "Closed" : "Open"}
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        <input 
                                            type="time" 
                                            className="form-control form-control-sm"
                                            value={day.start_time}
                                            onChange={(e) => handleTimeChange(index, "start_time", e.target.value)}
                                            disabled={day.is_closed}
                                        />
                                    </td>
                                    <td className="text-center">to</td>
                                    <td>
                                        <input 
                                            type="time" 
                                            className="form-control form-control-sm"
                                            value={day.end_time}
                                            onChange={(e) => handleTimeChange(index, "end_time", e.target.value)}
                                            disabled={day.is_closed}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-end mt-3">
                    <button className="btn btn-primary" onClick={handleSave}>Save Schedule</button>
                </div>
            </div>
        </div>
    );
}

export default PlaceScheduleManager;
