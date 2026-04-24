import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";


function RequireUserAuth() {
    const { store, dispatch } = useGlobalReducer();
    const userToken = store.userToken || localStorage.getItem("tokenUser");
  

    useEffect(() => {
        const tokenTest = () => {
            const updateToken = localStorage.getItem("tokenUser")
            if (updateToken && store.userToken !== updateToken) {
                return
            }
            if (!updateToken) {
                localStorage.removeItem("tokenUser")
                dispatch({ type: "USER_LOGOUT" });
            }
        }
        if (userToken && store.userToken !== userToken) {
            dispatch({
                type: "SET_USER_TOKEN",
                payload: userToken
            });
            return;
        }

        if (!userToken) {
            dispatch({ type: "USER_LOGOUT" });
        }

        window.addEventListener('tokenTest', tokenTest)
        window.addEventListener('storage', tokenTest)
        return () => {
            window.removeEventListener('tokenTest', tokenTest)
            window.removeEventListener('storage', tokenTest)
        }

    }, [dispatch, store.userToken, userToken]);

    if (!userToken) {
        return <Navigate to="/login/user" replace />;
    }

    return <Outlet />;
}

export default RequireUserAuth;
