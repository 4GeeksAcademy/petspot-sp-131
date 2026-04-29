import UserFavoriteCard from "./UserFavoriteCard";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";
import { getPlaces, getPrivateUser } from "../../../services/userPrivateService";

function UserFavoritesList() {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function loadPlaces() {
            try {
                const places = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: places
                });
            } catch (error) {
                console.error("Unable to load places:", error);
            }
        }

        loadPlaces();
    }, [dispatch, store.places.length]);

    useEffect(() => {
        async function loadPrivateUser() {
            try {
                const privateUser = await getPrivateUser();
                if (!privateUser) {
                    return;
                }

                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: privateUser
                });
            } catch (error) {
                console.error("Unable to load private user:", error);
            }
        }

        loadPrivateUser();
    }, [dispatch, store.privateUser?.id]);

    const allPlaces = store.places;
    const favoritePlaceIds = store.privateUser?.favorite_places || [];

    const favoritePlaces = favoritePlaceIds.map((favoritePlaceId) => {
        const matchingPlace = allPlaces.find((place) => place.id === favoritePlaceId);
        return matchingPlace;
    });


    return (
        <>
            {favoritePlaces && favoritePlaces.length > 0
                ? favoritePlaces.map((favoritePlace, i) => {
                    return <UserFavoriteCard favPlaceObj={favoritePlace} key={favoritePlace.id} />
                })
                : (
                    <p className="text-center">No favorites yet</p>
                    )}
        </>
    );
}

export default UserFavoritesList;
