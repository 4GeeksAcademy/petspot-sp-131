import { useEffect } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import UserReservationCard from "./UserReservationCard";

function UserReservationsList() {

    const { store } = useGlobalReducer()
    console.log(store.privateUser.reservations)

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 700 }}>
            {store.privateUser.reservations.map((reservation, i) => {
                return <UserReservationCard reservationObj={reservation} key={`${reservation}-${i}`} />
            })}
        </div>
    );
}

export default UserReservationsList;
