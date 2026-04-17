import { Link } from "react-router-dom";
import DeletePlaceConfirmation from "../../components/Places/DeletePlaceConfirmation";

function DeletePlace() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Delete Place</h1>
                <div className="text-center my-5">
                    <Link to="/places" className="btn btn-secondary">Go Back to Places</Link>
                </div>
                <DeletePlaceConfirmation />
            </div>
        </>
    )
}

export default DeletePlace;
