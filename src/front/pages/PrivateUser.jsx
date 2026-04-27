import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const PrivateUser = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("userToken");

        if (!token) {
            navigate("/login/user");
        }
    }, []);

    return (
        <div className="text-center mt-5">
            <h1>Private User Area</h1>
            <p>You are logged in.</p>
            <div className="mt-4">
                <Link to="/private/user/pets" className="btn btn-primary">
                    Gestionar mis Mascotas
                </Link>
            </div>
        </div>
    );
};

export default PrivateUser;