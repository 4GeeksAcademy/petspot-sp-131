import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Link } from "react-router-dom";

const FALLBACK_CENTER = { lat: 40.4168, lng: -3.7038 };
const FIT_BOUNDS_PADDING = { top: 150, right: 80, bottom: 110, left: 80 };
const MAX_FIT_BOUNDS_ZOOM = 12;

function UserPlacesMap({ places = [], user, includeUserLocation = false }) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });
    const mapRef = useRef(null);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const userPosition = useMemo(() => {
        if (!user?.latitude || !user?.longitude) {
            return null;
        }

        return {
            lat: Number(user.latitude),
            lng: Number(user.longitude),
        };
    }, [user?.latitude, user?.longitude]);

    const placesWithCoordinates = useMemo(
        () =>
            places
                .filter((place) => place.latitude && place.longitude)
                .map((place) => ({
                    ...place,
                    position: {
                        lat: Number(place.latitude),
                        lng: Number(place.longitude),
                    },
                })),
        [places]
    );

    useEffect(() => {
        if (!selectedPlace) {
            return;
        }

        const selectedPlaceExists = placesWithCoordinates.some(
            (place) => String(place.id) === String(selectedPlace.id)
        );

        if (!selectedPlaceExists) {
            setSelectedPlace(null);
        }
    }, [placesWithCoordinates, selectedPlace]);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || !window.google?.maps) {
            return;
        }

        const map = mapRef.current;
        const bounds = new window.google.maps.LatLngBounds();
        let pointsCount = 0;

        if (includeUserLocation && userPosition) {
            bounds.extend(userPosition);
            pointsCount += 1;
        }

        placesWithCoordinates.forEach((place) => {
            bounds.extend(place.position);
            pointsCount += 1;
        });

        if (pointsCount > 1) {
            map.fitBounds(bounds, FIT_BOUNDS_PADDING);
            window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
                if (map.getZoom() > MAX_FIT_BOUNDS_ZOOM) {
                    map.setZoom(MAX_FIT_BOUNDS_ZOOM);
                }
            });
            return;
        }

        if (placesWithCoordinates.length === 1) {
            map.panTo(placesWithCoordinates[0].position);
            map.setZoom(9);
            return;
        }

        if (includeUserLocation && userPosition) {
            map.panTo(userPosition);
            map.setZoom(9);
            return;
        }

        map.panTo(FALLBACK_CENTER);
        map.setZoom(6);
    }, [includeUserLocation, isLoaded, placesWithCoordinates, userPosition]);

    const initialCenter =
        (includeUserLocation && userPosition) ||
        placesWithCoordinates[0]?.position ||
        FALLBACK_CENTER;

    if (!isLoaded) return <p>Loading map...</p>;

    return (
        <GoogleMap
            mapContainerStyle={{ height: "500px", maxWidth: "1000px", borderRadius: "8px", margin: "auto" }}
            center={initialCenter}
            zoom={6}
            onLoad={(map) => {
                mapRef.current = map;
            }}
        >
            {includeUserLocation && userPosition && (
                <MarkerF
                    position={userPosition}
                    title={user.name ? `${user.name}'s location` : "Your location"}
                />
            )}

            {placesWithCoordinates.map((place) => (
                <MarkerF
                    key={place.id}
                    position={place.position}
                    title={place.name}
                    onClick={() => {
                        setSelectedPlace(place);
                        mapRef.current?.panTo(place.position);
                    }}
                />
            ))}

            {selectedPlace && (
                <InfoWindowF
                    position={selectedPlace.position}
                    onCloseClick={() => setSelectedPlace(null)}
                >
                    <div style={{ minWidth: "180px" }}>
                        <h6 className="mb-1">{selectedPlace.name}</h6>
                        <p className="mb-1 text-muted">
                            {selectedPlace.establishment_type
                                ? selectedPlace.establishment_type.toUpperCase()
                                : "Establishment"}
                        </p>
                        {(selectedPlace.city?.city || selectedPlace.address) && (
                            <p className="mb-2 small">
                                {selectedPlace.city?.city || selectedPlace.address}
                            </p>
                        )}
                        <Link to={`/user/private/places/view/${selectedPlace.id}`}>
                            View details
                        </Link>
                    </div>
                </InfoWindowF>
            )}
        </GoogleMap>
    );
}

export default UserPlacesMap;
