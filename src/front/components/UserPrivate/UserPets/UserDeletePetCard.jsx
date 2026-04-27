import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { deletePet, getPetById, getPrivateUser } from "../../../services/userPrivateService";

function UserDeletePetCard() {
    const { id } = useParams();
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadPet() {
            try {
                const petResponse = await getPetById(id);
                setPet(petResponse);
            } catch (error) {
                alert("Unable to load this pet right now. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        loadPet();
    }, [id]);

    async function handleDeletePet() {
        setIsDeleting(true);

        try {
            await deletePet(id);
            const privateUser = await getPrivateUser();
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: privateUser
            });
            navigate("/user/private/pets", { replace: true });
        } catch (error) {
            alert(error.message || "Unable to delete this pet right now. Please try again.");
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <p className="text-center text-body-secondary alert alert-secondary mx-auto" style={{ maxWidth: 600 }}>
                Loading pet details...
            </p>
        );
    }

    return (
        <div
            className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
            style={{ maxWidth: 700 }}
        >
            <p className="mb-3 fw-semibold text-danger">
                Warning: this action will permanently delete {pet?.name ? `"${pet.name}"` : "this pet"}.
            </p>
            <p className="mb-0">
                Once deleted, this pet will be removed from your profile and private user area.
            </p>

            <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5">
                <Link to="/user/private/pets" className="btn btn-outline-secondary">
                    Go Back to My Pets
                </Link>
                <button type="button" className="btn btn-danger" onClick={handleDeletePet} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Pet"}
                </button>
            </div>
        </div>
    );
}

export default UserDeletePetCard;
