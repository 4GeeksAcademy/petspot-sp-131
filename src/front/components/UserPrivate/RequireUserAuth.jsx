import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RequireUserAuth({ children }) {

    const navigate = useNavigate()
    const userToken = localStorage.getItem("tokenUser");

    useEffect(() => {
        if (!userToken) {
            navigate("/login/user")
            return
        }
    }, [])

    return children;
};

export default RequireUserAuth;