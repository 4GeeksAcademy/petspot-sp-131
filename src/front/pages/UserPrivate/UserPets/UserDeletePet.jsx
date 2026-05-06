import UserDeletePetCard from "../../../components/UserPrivate/UserPets/UserDeletePetCard";

function UserDeletePet() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-trash me-2" style={{ color: "var(--admin-danger)" }} />
                Eliminar mascota
            </h5>
            <UserDeletePetCard />
        </div>
    );
}

export default UserDeletePet;
