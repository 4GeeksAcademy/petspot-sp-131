import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import FavoriteCard from "./FavoriteCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function FavoritesList() {

    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getFavorites() {
            try {
                const response = await fetch(`${backendUrl}/api/favorites`)
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }
                const responseJSON = await response.json()
                dispatch({
                    type: "GET_FAVORITES",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load favorites right now. Please try again.")
            }
        }
        getFavorites()
    }, [])

    const favoritesByUser = Object.values(
        store.favorites.reduce((groups, favorite) => {
            const groupKey = favorite.user_id

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    user_id: favorite.user_id,
                    user_name: favorite.user_name,
                    favorites: []
                }
            }

            groups[groupKey].favorites.push(favorite)
            return groups
        }, {})
    )
    

    return (
        <>
            {favoritesByUser.length > 0
                ? favoritesByUser.map((favoriteGroup) => {
                    return <FavoriteCard favoriteGroup={favoriteGroup} key={favoriteGroup.user_id} />
                })
                : "No favorites registered yet."}
        </>
    )
}

export default FavoritesList;
