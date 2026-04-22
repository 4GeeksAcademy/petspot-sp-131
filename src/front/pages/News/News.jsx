import NewsList from "../../components/News/NewsList";
import { Link } from "react-router-dom";

function News() {
    return (
        <>
            <div className="px-3 m-auto">
                <h1 className="text-center my-5 display-3">PetSpot News {"\u{1F4F0}"}</h1>
                <div className="text-center my-5">
                    <Link to="/news/add" className="btn btn-success">Add News</Link>
                </div>
                <NewsList />
            </div>
        </>
    )
}

export default News;