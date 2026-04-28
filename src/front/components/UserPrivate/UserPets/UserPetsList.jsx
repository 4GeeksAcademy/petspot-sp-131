import { useEffect, useState } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import UserPetCard from "./UserPetCard";
import { getPrivateUser, getUserPets } from "../../../services/userPrivateService";

function UserPetsList() {
    const { store, dispatch } = useGlobalReducer();
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadPets() {
            try {
                const pets = await getUserPets();

                if (store.privateUser?.id) {
                    dispatch({
                        type: "GET_PRIVATE_USER",
                        payload: {
                            ...store.privateUser,
                            pets
                        }
                    });
                } else {
                    const privateUser = await getPrivateUser();
                    dispatch({
                        type: "GET_PRIVATE_USER",
                        payload: {
                            ...privateUser,
                            pets
                        }
                    });
                }

                setMessage("");
            } catch (error) {
                console.error("Unable to load pets:", error);
                setMessage("Unable to load your pets right now. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        loadPets();
    }, [dispatch]);

    const pets = store.privateUser?.pets || [];

    if (isLoading) {
        return (
            <p className="text-center text-body-secondary alert alert-secondary mx-auto" style={{ maxWidth: 600 }}>
                Loading your pets...
            </p>
        );
    }

    return (
        <>
            {message && (
                <p className="text-center alert alert-danger mx-auto" style={{ maxWidth: 700 }}>
                    {message}
                </p>
            )}

            {pets.length > 0 ? (
                <>
                    {pets.map((pet) => (
                        <UserPetCard petObj={pet} key={pet.id} />
                    ))}
                </>

            ) : (
                <p className="text-center alert alert-secondary mx-auto mb-0" style={{ maxWidth: 700 }}>
                    You have not added any pets yet.
                </p>
            )}
        </>
    );
}

export default UserPetsList;
