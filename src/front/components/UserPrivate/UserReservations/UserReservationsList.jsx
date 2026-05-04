import { useEffect } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import UserReservationCard from "./UserReservationCard";
import { getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserReservationsList() {
    const { store, dispatch } = useGlobalReducer()

    const loadPrivateUser = async () => {
        try {
            const privateUser = await getPrivateUser();
            if (privateUser) {
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: privateUser
                });
            }
        } catch (error) {
            console.error("Unable to load private user:", error);
        }
    };

    useEffect(() => {
        if (!store.privateUser?.id) {
            loadPrivateUser();
        }
    }, [dispatch, store.privateUser?.id]);

    async function handleCancelReservation(reservationId) {
        if (!confirm("Are you sure you want to cancel this reservation?")) return;
        try {
            const userToken = localStorage.getItem("userToken");
            if (!userToken) {
                throw new Error("You need to sign in before cancelling a reservation.");
            }

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
                const errorData = await response.json();
                throw new Error(errorData.response || errorData.msg || `Request failed with status ${response.status}`);
            }

            const responseJSON = await response.json();
            await loadPrivateUser();

            if (responseJSON.payment_status === "refunded") {
                alert("Your reservation was cancelled and your payment has been refunded.");
            } else {
                alert("Your reservation was cancelled successfully.");
            }
            
        } catch (error) {
            alert(error.message || "Unable to cancel reservation right now. Please try again.");
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
