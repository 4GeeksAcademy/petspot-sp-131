import AddPlaceForm from "../../components/Places/AddPlaceForm";
import { Link } from "react-router-dom";

function AddPlace() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Add a New Place</h1>
                <div className="text-center my-5">
                    <Link to="/places" className="btn btn-secondary">Go Back to Places</Link>
                </div>
                <AddPlaceForm />
            </div>
        </>
    )
}

export default AddPlace;