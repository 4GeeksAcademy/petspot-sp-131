import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function UserMap({ latitude, longitude }) {
  if (!latitude || !longitude) {
    return <p>No user location yet.</p>;
  }

  const position = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "10px"}}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={position}>
        <Popup>User location</Popup>
      </Marker>
    </MapContainer>
  );
}

export default UserMap;