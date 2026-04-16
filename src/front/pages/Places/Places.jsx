import PlacesList from "../../components/Places/PlacesList";
import { Link } from "react-router-dom";

function Places() {
    return (
        <>
            <div className="px-3 m-auto">
                <h1 className="text-center my-5 display-3">PetSpot Places {"\u{1F43E}"}</h1>
                <div className="text-center my-5">
                    <Link to="#" className="btn btn-success">Add New Place</Link>
                </div>
                <PlacesList />
            </div>
        </>
    )
}

export default Places;
