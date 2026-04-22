import AddNewsForm from "../../components/News/AddNewsForm";
import { Link } from "react-router-dom";

function AddNews() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Add News</h1>
                <div className="text-center my-5">
                    <Link to="/news" className="btn btn-secondary">Go Back to News</Link>
                </div>
                <AddNewsForm />
            </div>
        </>
    )
}

export default AddNews;