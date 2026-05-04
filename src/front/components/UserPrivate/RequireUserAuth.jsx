import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;


function RequireUserAuth() {

    const { store, dispatch } = useGlobalReducer();
    const [token, setToken] = useState(() => localStorage.getItem("userToken"));
    const navigate = useNavigate()

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
                    navigate('/user/login', { replace: true })
                }
            }
            async function tokenHasExpired() {
                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                });
    
                if (response.status === 401 || response.status === 404) {
                    localStorage.removeItem("userToken")
                    dispatch({ type: "USER_LOGOUT" });
                    navigate('/user/login', { replace: true })
                    return;
                }
            }
            tokenHasExpired()

        }, 500);

        // Por si lo borran desde otra pestaña
        const handleStorage = () => {
            const currentToken = localStorage.getItem("userToken");
            setToken(currentToken);
            if (!currentToken) {
                dispatch({ type: "USER_LOGOUT" })
                navigate('/user/login', { replace: true })
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", handleStorage);
        };

    }, [token, store.userToken, dispatch]);

    if (!token) {
        dispatch({ type: "USER_LOGOUT" });
        return <Navigate to="/user/login" replace />;
    }

    return <Outlet />;

}

export default RequireUserAuth;
