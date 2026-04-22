import ReservationCard from "./ReservationCard";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function ReservationsList() {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getReservations() {
            try {
                const response = await fetch(`${backendUrl}/api/reservations`);

                if (response.status === 404) {
                    dispatch({
                        type: "GET_RESERVATIONS",
                        payload: []
                    });
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();

                dispatch({
                    type: "GET_RESERVATIONS",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load reservations right now. Please try again.");
            }
        }

        getReservations();
    }, []);

    return (
        <>
            {store.reservations.length > 0
                ? store.reservations.map((reservation) => (
                      <ReservationCard reservationObj={reservation} key={reservation.id} />
                  ))
                : "No reservations registered yet."}
        </>
    );
}

export default ReservationsList;