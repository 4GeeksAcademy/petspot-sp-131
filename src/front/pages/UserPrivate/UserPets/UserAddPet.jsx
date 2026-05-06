import UserPetForm from "../../../components/UserPrivate/UserPets/UserPetForm";

function UserAddPet() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-plus me-2" style={{ color: "var(--admin-primary)" }} />
                Añadir mascota
            </h5>
            <UserPetForm mode="create" />
        </div>
    );
}

export default UserAddPet;
