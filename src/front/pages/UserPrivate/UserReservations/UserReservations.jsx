import UserReservationsList from "../../../components/UserPrivate/UserReservations/UserReservationsList";

function UserReservations() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">My Reservations</h1>
            <UserReservationsList />
        </div>
    );
}

export default UserReservations;
