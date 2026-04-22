import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PrivateUser = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("tokenUser");

        if (!token) {
            navigate("/login/user");
        }
    }, []);

    return (
        <div className="text-center mt-5">
            <h1>Private User Area</h1>
            <p>You are logged in.</p>
        </div>
    );
};

export default PrivateUser;