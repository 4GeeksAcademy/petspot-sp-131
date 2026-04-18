import AddCityForm from "../../components/Cities/AddCityForm";
import { Link } from "react-router-dom";

function AddCity() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Add a New City</h1>
                <div className="text-center my-5">
                    <Link to="/cities" className="btn btn-secondary">Go Back to Cities</Link>
                </div>
                <AddCityForm />
            </div>
        </>
    )
}

export default AddCity;
