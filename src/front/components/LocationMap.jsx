import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

function LocationMap({ latitude, longitude, label = "Location" }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!latitude || !longitude) return <p>No location available.</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  const position = {
    lat: Number(latitude),
    lng: Number(longitude),
  };

  return (
    <GoogleMap
      mapContainerStyle={{ height: "300px", width: "100%", borderRadius: "5px"}}
      center={position}
      zoom={13}
    >
      <MarkerF position={position} title={label} />
    </GoogleMap>
  );
}

export default LocationMap;