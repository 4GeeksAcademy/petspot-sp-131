import { useParams } from "react-router-dom";
import UserPetForm from "../../../components/UserPrivate/UserPets/UserPetForm";

function UserEditPet() {
    const { id } = useParams();

    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">Edit Pet</h1>
            <UserPetForm mode="edit" petId={id} />
        </div>
    );
}

export default UserEditPet;
