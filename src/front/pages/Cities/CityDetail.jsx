import { Link } from "react-router-dom";
import CityDetailCard from "../../components/Cities/CityDetailCard";

function CityDetail() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">City Details</h1>
                <div className="text-center my-5">
                    <Link to="/cities" className="btn btn-secondary">Go Back to Cities</Link>
                </div>
                <CityDetailCard />
            </div>
        </>
    )
}

export default CityDetail;
