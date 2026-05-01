import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PlaceStatisticsView({ placeId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!placeId) return;
      try {
        const response = await fetch(`${backendUrl}/api/places/${placeId}/statistics`);
        if (response.ok) {
          const statsData = await response.json();
          // Transform if needed: data should look like { date: "2024-05-01", count: 5 }
          setData(statsData);
        }
      } catch (error) {
        console.error("Error fetching statistics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [placeId]);

  if (loading) return <div>Loading statistics...</div>;

  if (data.length === 0) {
    return (
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Reservation Flow (Last 30 Days)</h5>
        </div>
        <div className="card-body text-center text-muted p-5">
          <i className="fas fa-chart-line fa-3x mb-3 text-light"></i>
          <p>No reservations data available yet to display statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0">Reservation Flow (Last 30 Days)</h5>
      </div>
      <div className="card-body" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(tick) => {
                const parts = tick.split("-");
                return `${parts[1]}/${parts[2]}`;
              }} 
              tick={{ fontSize: 12, fill: '#6c757d' }} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 12, fill: '#6c757d' }} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 .125rem .25rem rgba(0,0,0,.075)' }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Reservations"
              stroke="#0d6efd"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PlaceStatisticsView;
