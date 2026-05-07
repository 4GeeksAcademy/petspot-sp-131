import { useEffect, useMemo, useRef } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import { getDefaultPlaceThumbnail } from "../../Places/placeFormUtils";
import { MUTED_MAP_STYLES } from "../../mapStyles";

const FALLBACK_CENTER = { lat: 40.4168, lng: -3.7038 };
const FIT_BOUNDS_PADDING = { top: 150, right: 80, bottom: 110, left: 80 };
const MAX_FIT_BOUNDS_ZOOM = 12;
const HOME_PIN_COLORS = {
    place: {
        fill: "#fe8f90",
        glyph: "#ffffff"
    },
    selected: {
        fill: "#000000",
        stroke: "#fe8f90",
        glyph: "#ffffff"
    },
    user: {
        fill: "#fddad3",
        stroke: "#000000",
        glyph: "#000000"
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

    const markerIcons = useMemo(() => {
        if (!window.google?.maps) {
            return {
                place: undefined,
                selected: undefined,
                user: undefined
            };
        }

        const buildIcon = (colorConfig) => ({
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createMarkerSvg(colorConfig))}`,
            scaledSize: new window.google.maps.Size(44, 56),
            anchor: new window.google.maps.Point(22, 54),
            labelOrigin: new window.google.maps.Point(22, 23)
        });

        return {
            place: buildIcon(HOME_PIN_COLORS.place),
            selected: buildIcon(HOME_PIN_COLORS.selected),
            user: buildIcon(HOME_PIN_COLORS.user)
        };
    }, [isLoaded]);

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
                options={{
                    styles: MUTED_MAP_STYLES
                }}
                onLoad={(map) => {
                    mapRef.current = map;
                }}
            >
                {includeUserLocation && userPosition && (
                    <MarkerF
                        position={userPosition}
                        title={user.name ? `${user.name}'s location` : "Your location"}
                        icon={markerIcons.user}
                    />
                )}

                {placesWithCoordinates.map((place) => (
                    <MarkerF
                        key={place.id}
                        position={place.position}
                        title={place.name}
                        icon={
                            String(place.id) === String(selectedPlaceWithCoordinates?.id)
                                ? markerIcons.selected
                                : markerIcons.place
                        }
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
