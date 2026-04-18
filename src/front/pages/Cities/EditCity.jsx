import EditCityForm from "../../components/Cities/EditCityForm";
import { Link } from "react-router-dom";

function EditCity() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Edit City</h1>
                <div className="text-center my-5">
                    <Link to="/cities" className="btn btn-secondary">Go Back to Cities</Link>
                </div>
                <EditCityForm />
            </div>
        </>
    )
}

export default EditCity;
