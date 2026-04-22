import { Link } from "react-router-dom";
import LoginPlaceForm from "../../components/Places/LoginPlaceForm";

function LoginPlace() {

    return(
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Place Log In 🔐</h1>
                <div className="text-center my-5">
                    <Link to="/places" className="btn btn-secondary">Go Back to Places</Link>
                </div>
                <LoginPlaceForm />
            </div>
        </>
    )
}

export default LoginPlace;