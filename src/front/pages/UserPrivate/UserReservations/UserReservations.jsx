import UserReservationsList from "../../../components/UserPrivate/UserReservations/UserReservationsList";

function UserReservations() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-calendar-check me-2" style={{ color: "var(--admin-primary)" }} />
                Mis reservas
            </h5>
            <UserReservationsList />
        </div>
    );
}

export default UserReservations;
