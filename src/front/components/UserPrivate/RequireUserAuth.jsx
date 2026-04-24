import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

function RequireUserAuth() {
    const { store, dispatch } = useGlobalReducer();
    const userToken = store.userToken || localStorage.getItem("tokenUser");

    useEffect(() => {
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
    }, [dispatch, store.userToken, userToken]);

    if (!userToken) {
        return <Navigate to="/login/user" replace />;
    }

    return <Outlet />;
}

export default RequireUserAuth;
