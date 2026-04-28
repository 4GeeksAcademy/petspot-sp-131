import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";


function RequireUserAuth() {

    const { store, dispatch } = useGlobalReducer();
    const [token, setToken] = useState(() => localStorage.getItem("userToken"));

    useEffect(() => {

        // Sincroniza el store con el token del localStorage al montar
        if (token && store.userToken !== token) {
            dispatch({ type: "SET_USER_TOKEN", payload: token });
        }

        // Revisa cada 500ms si el token sigue ahí
        const interval = setInterval(() => {
            const currentToken = localStorage.getItem("userToken");
            if (currentToken !== token) {
                setToken(currentToken); // <- esto fuerza el re-render
                if (!currentToken) {
                    dispatch({ type: "USER_LOGOUT" });
                }
            }

        }, 500);

        // Por si lo borran desde otra pestaña
        const handleStorage = () => {
            const currentToken = localStorage.getItem("userToken") || localStorage.getItem("tokenUser");
            setToken(currentToken);
            if (!currentToken) dispatch({ type: "USER_LOGOUT" });
        };

        window.addEventListener("storage", handleStorage);
        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", handleStorage);
        };

    }, [token, store.userToken, dispatch]);

    if (!token) {
        return <Navigate to="/login/user" replace />;
    }

    return <Outlet />;

}

export default RequireUserAuth;
