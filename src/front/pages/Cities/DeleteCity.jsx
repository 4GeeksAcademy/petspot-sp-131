import { Link } from "react-router-dom";
import DeleteCityConfirmation from "../../components/Cities/DeleteCityConfirmation";

function DeleteCity() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Delete City</h1>
                <div className="text-center my-5">
                    <Link to="/cities" className="btn btn-secondary">Go Back to Cities</Link>
                </div>
                <DeleteCityConfirmation />
            </div>
        </>
    )
}

export default DeleteCity;
