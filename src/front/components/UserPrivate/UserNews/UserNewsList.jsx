import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";
import UserNewsCard from "./UserNewsCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function UserNewsList() {

    const { store, dispatch } = useGlobalReducer()

    useEffect(() => {
        async function getNews() {
            try {
                const response = await fetch(`${backendUrl}/api/news`)
                if (!response.ok) {
                    alert(`Request failed with status ${response.status}`)
                }
                const responseJSON = await response.json()

                dispatch({
                    type: "GET_NEWS",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load news right now. Please try again.")
            }
        }
        getNews()
    }, [])

    return (
        <>
            {store.news.length > 0
                ? store.news.map((news) => {
                    return <UserNewsCard newsObj={news} key={news.id} />
                })
                : (
                    <p className="text-center">No news yet</p>
                    )}
        </>
    );
}

export default UserNewsList;
