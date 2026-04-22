import { Link } from "react-router-dom";

function NewsCard({ newsObj }) {

    const { title, id, post_date, post_type, admin_name } = newsObj

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{title}</h5>
                    <p className="card-text m-0">Type: {post_type}</p>
                    <p className="card-text m-0">Date: {post_date}</p>
                    <p className="card-text m-0">By: {admin_name}</p>
                    <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                        <Link to={`/news/view/${id}`} className="btn btn-outline-primary">View</Link>
                        <Link to={`/news/edit/${id}`} className="btn btn-outline-warning">Edit</Link>
                        <Link to={`/news/delete/${id}`} className="btn btn-outline-danger">Delete</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewsCard;