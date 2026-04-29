import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { handleRemoveFromFavorites } from "../../../services/userPrivateService";

function UserFavoriteCard({ favPlaceObj }) {
    const { dispatch } = useGlobalReducer();

    const { name, city, establishment_type, id } = favPlaceObj
    const establishmentTypeEmoji = {
        bar: "\u{1F37A}",
        restaurant: "\u{1F35D}",
        cafe: "\u{2615}"
    }

    async function removeFromFavorites() {
        try {
            const updatedPrivateUser = await handleRemoveFromFavorites(id);
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: updatedPrivateUser
            });
        } catch (error) {
            alert("Unable to remove favorite right now. Please try again.");
        }
    }

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <div className="card-header d-flex justify-content-between align-items-center bg-secondary-subtle p-0 mb-3">
                        <h5 className="card-title   mb-3 ps-0 h2">{name}</h5>
                        <button className="btn btn-close" onClick={removeFromFavorites}></button>
                    </div>
                    <h6 className="card-subtitle mb-2 text-body-secondary">
                        {establishmentTypeEmoji[establishment_type]}
                        <span className="fst-italic">{establishment_type.toUpperCase()}</span>
                    </h6>
                    <div className="mb-3 d-flex flex-wrap gap-2 fw-bold">
                        {"\u{1F4CC}"}{city.city}
                    </div>
                    <div className="d-flex flex-column gap-3">
                        <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                            <Link to={`/user/private/places/view/${id}`} className="btn btn-outline-primary">View</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserFavoriteCard;
