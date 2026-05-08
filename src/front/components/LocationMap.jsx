import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MUTED_MAP_STYLES } from "./mapStyles";

const HOME_PIN_COLORS = {
    place: {
        fill: "#fe8f90",
        glyph: "#ffffff"
    },
    selected: {
        fill: "#000000",
        stroke: "#fe8f90",
        glyph: "#ffffff"
    }
};

function createMarkerSvg({ fill, stroke, glyph }) {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56" fill="none">
            <path d="M22 54C22 54 39 36.71 39 23C39 13.6112 31.3888 6 22 6C12.6112 6 5 13.6112 5 23C5 36.71 22 54 22 54Z" fill="${fill}" stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round"/>
            <circle cx="22" cy="23" r="7.2" fill="${glyph}" />
        </svg>
    `.trim();
}

function LocationMap({ latitude, longitude, label = "Location", draggable = false, onPositionChange }) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    if (!latitude || !longitude) return <p>No location available.</p>;
    if (!isLoaded) return <p>Loading map...</p>;

    const position = {
        lat: Number(latitude),
        lng: Number(longitude),
    };

    const markerIcon = window.google?.maps
        ? {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                createMarkerSvg(draggable ? HOME_PIN_COLORS.selected : HOME_PIN_COLORS.place)
            )}`,
            scaledSize: new window.google.maps.Size(44, 56),
            anchor: new window.google.maps.Point(22, 54),
            labelOrigin: new window.google.maps.Point(22, 23)
        }
        : undefined;

    return (
        <GoogleMap
            mapContainerStyle={{ height: "300px", width: "100%", borderRadius: "5px" }}
            center={position}
            zoom={15}
            options={{
                styles: MUTED_MAP_STYLES
            }}
        >
            <MarkerF
                position={position}
                icon={markerIcon}
                title={label}
                draggable={draggable}
                onDragEnd={(event) => {
                    if (!draggable || !onPositionChange) return;

                    onPositionChange({
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng(),
                    });
                }}
            />
        </GoogleMap>
    );
}

export default LocationMap;
