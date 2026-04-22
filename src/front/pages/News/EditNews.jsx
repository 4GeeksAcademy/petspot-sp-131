import EditNewsForm from "../../components/News/EditNewsForm";
import { Link } from "react-router-dom";

function EditNews() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Edit News</h1>
                <div className="text-center my-5">
                    <Link to="/news" className="btn btn-secondary">Go Back to News</Link>
                </div>
                <EditNewsForm />
            </div>
        </>
    )
}

export default EditNews;