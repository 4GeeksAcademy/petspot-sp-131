import EditPlaceForm from "../../components/Places/EditPlaceForm";
import { Link } from "react-router-dom";

function EditPlace() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Edit Place</h1>
                <div className="text-center my-5">
                    <Link to="/places" className="btn btn-secondary">Go Back to Places</Link>
                </div>
                <EditPlaceForm />
            </div>
        </>
    )
}

export default EditPlace;