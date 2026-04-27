import { Link } from "react-router-dom";
import UserPetsList from "../../../components/UserPrivate/UserPets/UserPetsList";

function UserPets() {
    return (
        <div className="mx-auto">
            <h1 className="text-center my-5 display-3">My Pets</h1>
            <div className="d-grid d-sm-flex gap-2 justify-content-sm-center my-5">
                <Link to="/user/private/profile" className="btn btn-outline-secondary">
                    Go Back to My Profile
                </Link>
                <Link to="/user/private/pets/add" className="btn btn-success">
                    Add Pet
                </Link>
            </div>
            <UserPetsList />
        </div>
    );
}

export default UserPets;
