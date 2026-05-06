import { useParams } from "react-router-dom";
import UserPetForm from "../../../components/UserPrivate/UserPets/UserPetForm";

function UserEditPet() {
    const { id } = useParams();

    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-pen me-2" style={{ color: "var(--admin-primary)" }} />
                Editar mascota
            </h5>
            <UserPetForm mode="edit" petId={id} />
        </div>
    );
}

export default UserEditPet;
