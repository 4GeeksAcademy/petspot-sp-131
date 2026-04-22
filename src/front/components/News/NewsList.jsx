import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import NewsCard from "./NewsCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function NewsList() {

    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getNews() {
            try {
                const response = await fetch(`${backendUrl}/api/news`)
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
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
                    return <NewsCard newsObj={news} key={news.id} />
                })
                : "No news registered yet."}
        </>
    )
}

export default NewsList;