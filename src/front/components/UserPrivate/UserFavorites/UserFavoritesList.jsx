import UserFavoriteCard from "./UserFavoriteCard";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserFavoritesList() {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getPlaces() {
            try {
                const response = await fetch(`${backendUrl}/api/places`);
                if (!response.ok) {
                    throw new Error(`Places request failed with status ${response.status}`);
                }

                const places = await response.json();
                dispatch({
                    type: "GET_PLACES",
                    payload: places
                });
            } catch (error) {
                console.error("Unable to load places:", error);
            }
        }

        getPlaces();
    }, [dispatch, store.places.length]);

    useEffect(() => {
        async function getPrivateUser() {
            try {
                const userToken = localStorage.getItem("userToken");
                if (!userToken) {
                    return;
                }

                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`User request failed with status ${response.status}`);
                }

                const privateUser = await response.json();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: privateUser
                });
            } catch (error) {
                console.error("Unable to load private user:", error);
            }
        }

        getPrivateUser();
    }, [dispatch, store.privateUser?.id]);

    const allPlaces = store.places;
    const favoritePlaceIds = store.privateUser?.favorite_places || [];

    const favoritePlaces = favoritePlaceIds.map((favoritePlaceId) => {
        const matchingPlace = allPlaces.find((place) => place.id === favoritePlaceId);
        return matchingPlace;
    });


    return (
        <>
            {favoritePlaces.length > 0
                ? favoritePlaces.map((favoritePlace) => {
                    return <UserFavoriteCard favPlaceObj={favoritePlace} key={favoritePlace.id} />
                })
                : (
                    <p className="text-center">No favorites yet</p>
                    )}
        </>
    );
}

export default UserFavoritesList;
