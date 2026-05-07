import { useEffect, useMemo, useRef } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import { getDefaultPlaceThumbnail } from "../../Places/placeFormUtils";

const FALLBACK_CENTER = { lat: 40.4168, lng: -3.7038 };
const FIT_BOUNDS_PADDING = { top: 150, right: 80, bottom: 110, left: 80 };
const MAX_FIT_BOUNDS_ZOOM = 12;

function UserPlacesMap({
    places = [],
    user,
    includeUserLocation = false,
    selectedPlace,
    setSelectedPlace
}) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });
    const mapRef = useRef(null);

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

    const selectedPlaceWithCoordinates = useMemo(
        () =>
            selectedPlace
                ? placesWithCoordinates.find((place) => String(place.id) === String(selectedPlace.id)) || null
                : null,
        [placesWithCoordinates, selectedPlace]
    );

    useEffect(() => {
        if (!selectedPlace) {
            return;
        }

        if (!selectedPlaceWithCoordinates) {
            setSelectedPlace(null);
        }
    }, [selectedPlace, selectedPlaceWithCoordinates, setSelectedPlace]);

    useEffect(() => {
        if (!selectedPlaceWithCoordinates || !mapRef.current) {
            return;
        }

        mapRef.current.panTo(selectedPlaceWithCoordinates.position);
    }, [selectedPlaceWithCoordinates]);

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

    if (!isLoaded) return <p className="user-places__empty">Loading map...</p>;

    return (
        <div className="user-places__map">
            <GoogleMap
                mapContainerClassName="user-places__map-canvas"
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

                {selectedPlaceWithCoordinates && (
                    <InfoWindowF
                        position={selectedPlaceWithCoordinates.position}
                        onCloseClick={() => setSelectedPlace(null)}
                    >
                        <div className="user-places__map-info">
                            <div className="user-places__map-info-media">
                                <img
                                    src={
                                        selectedPlaceWithCoordinates.image_url ||
                                        getDefaultPlaceThumbnail(selectedPlaceWithCoordinates.establishment_type)
                                    }
                                    alt={selectedPlaceWithCoordinates.name}
                                    className="user-places__map-info-image"
                                />
                            </div>
                            <div className="user-places__map-info-content">
                                <p className="user-places__map-info-type">
                                    {selectedPlaceWithCoordinates.establishment_type
                                        ? selectedPlaceWithCoordinates.establishment_type.toUpperCase()
                                        : "Establishment"}
                                </p>
                                <h6 className="user-places__map-info-title">{selectedPlaceWithCoordinates.name}</h6>
                                {(selectedPlaceWithCoordinates.city?.city || selectedPlaceWithCoordinates.address) && (
                                    <p className="user-places__map-info-address">
                                        {selectedPlaceWithCoordinates.city?.city || selectedPlaceWithCoordinates.address}
                                    </p>
                                )}
                                <Link
                                    to={`/user/private/places/view/${selectedPlaceWithCoordinates.id}`}
                                    className="user-places__map-info-link"
                                >
                                    View details
                                </Link>
                            </div>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>
    );
}

export default UserPlacesMap;
