import PlacePrivateCard from "../../components/Places/PlacePrivateCard";
import { useNavigate } from "react-router-dom";

function PrivatePlace() {
    const navigate = useNavigate();

    function handleLogOutClick() {
        localStorage.removeItem("token_place")
        navigate("/places/login")
    }

    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Private Place Page</h1>
                <div className="text-center my-5">
                    <button onClick={handleLogOutClick} className="btn btn-secondary">Log Out</button>
                </div>
                <PlacePrivateCard />
            </div>
        </>
    )
}

export default PrivatePlace;
