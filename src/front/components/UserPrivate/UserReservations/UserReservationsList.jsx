import { useEffect } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import UserReservationCard from "./UserReservationCard";
import { getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserReservationsList() {
    const { store, dispatch } = useGlobalReducer()

    useEffect(() => {
        if (store.privateUser?.id) {
            return;
        }

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

    async function handleCancelReservation(reservationId) {
        try {
            const userToken = localStorage.getItem("userToken");
            const response = await fetch(`${backendUrl}/api/users/private/reservations`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    reservation_id: reservationId.toString()
                })
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            await loadPrivateUser();
        } catch (error) {
            alert("Unable to cancel reservation right now. Please try again.");
        }
    }

    const reservations = store.privateUser?.reservations || [];

    return (
        <>
            {reservations.length > 0
                ? reservations.map((reservation, i) => {
                    return <UserReservationCard reservationObj={reservation} onCancelReservation={handleCancelReservation} key={`${reservation}-${i}`} />
                })
                : (
                    <p className="text-center">No reservations yet</p>
                )
            }
        </>
    );
}

export default UserReservationsList;
