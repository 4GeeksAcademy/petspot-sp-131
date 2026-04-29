import UserPetForm from "../../../components/UserPrivate/UserPets/UserPetForm";

function UserAddPet() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">Add Pet</h1>
            <UserPetForm mode="create" />
        </div>
    );
}

export default UserAddPet;
