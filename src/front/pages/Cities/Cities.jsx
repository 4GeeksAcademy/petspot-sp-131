import CitiesList from "../../components/Cities/CitiesList";
import { Link } from "react-router-dom";

function Cities() {
    return (
        <>
            <div className="px-3 m-auto">
                <h1 className="text-center my-5 display-3">PetSpot Cities {"\u{1F43E}"}</h1>
                <div className="text-center my-5">
                    <Link to="/cities/add" className="btn btn-success">Add a New City</Link>
                </div>
                <CitiesList />
            </div>
        </>
    )
}

export default Cities;
