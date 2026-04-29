import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getPrivateUser } from "../../../services/userPrivateService";
import LocationMap from "../../LocationMap";

function UserProfileCard() {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                return;
            }

            try {
                const responseJSON = await getPrivateUser();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        loadPrivateUser();
    }, [dispatch, store.privateUser?.id]);

    if (!store.privateUser?.id) {
        return (
            <p className="text-center text-body-secondary alert alert-secondary mx-auto" style={{ maxWidth: 600 }}>
                Loading your profile...
            </p>
        );
    }

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 700 }}>
            <div className="mb-2">
                <span className="fw-bold">Name: </span>{store.privateUser.name}
            </div>
            <div className="mb-2">
                <span className="fw-bold">Email: </span>{store.privateUser.email}
            </div>
            <div className="mb-2">
                <span className="fw-bold">Pets: </span>{store.privateUser.pets?.length || 0}
                {store.privateUser.pets?.length > 0 && (
                    <div className="mt-2">
                        {store.privateUser.pets.map((pet) => (
                            <div key={pet.id} className="small text-body-secondary">
                                {pet.animal_type} · {pet.name} · {pet.race_name || pet.other_type || pet.animal_type}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {(store.privateUser.latitude && store.privateUser.longitude)
                &&
                <div className="mb-4">
                    <span className="fw-bold">Address: </span>{store.privateUser.address}
                </div>
            }
            <LocationMap
                latitude={store.privateUser.latitude}
                longitude={store.privateUser.longitude}
                label="User location"
            />
            <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5">
                <Link to="/user/private/pets" className="btn btn-outline-primary">Manage pets</Link>
                <Link to="/user/private/profile/edit" className="btn btn-outline-success">Edit profile</Link>
                <Link to="/user/private/profile/delete" className="btn btn-outline-danger">Delete account</Link>
            </div>
        </div>
    );
}

export default UserProfileCard;
