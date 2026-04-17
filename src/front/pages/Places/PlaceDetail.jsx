import { Link } from "react-router-dom";
import PlaceDetailCard from "../../components/Places/PlaceDetailCard";

function PlaceDetail() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Place Details</h1>
                <div className="text-center my-5">
                    <Link to="/places" className="btn btn-secondary">Go Back to Places</Link>
                </div>
                <PlaceDetailCard />
            </div>
        </>
    )
}

export default PlaceDetail;
