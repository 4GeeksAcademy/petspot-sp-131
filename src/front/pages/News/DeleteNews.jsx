import { Link } from "react-router-dom";
import DeleteNewsConfirmation from "../../components/News/DeleteNewsConfirmation";

function DeleteNews() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Delete News</h1>
                <div className="text-center my-5">
                    <Link to="/news" className="btn btn-secondary">Go Back to News</Link>
                </div>
                <DeleteNewsConfirmation />
            </div>
        </>
    )
}

export default DeleteNews;