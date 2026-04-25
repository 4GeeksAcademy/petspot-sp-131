import { Link } from "react-router-dom";

function UserNewsCard({newsObj}) {

    const {
        content,
        post_date,
        post_type,
        title,
        id
    } = newsObj

    const postTypeEmoji = {
        normative: "⚠️",
        news: "📰",
        event: "📆"
    }

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{title}</h5>
                    <h6 className="card-subtitle mb-2 text-body-secondary">
                        {postTypeEmoji[post_type]}
                        <span className="fst-italic">{post_type}</span>
                    </h6>
                    <div className="mb-3 d-flex flex-wrap gap-2 fw-bold">
                        {"🕑"}{post_date}
                    </div>
                    <div className="d-flex flex-column gap-3">
                        <p className="card-text m-0">{content}</p>
                        <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                            <Link to={`/user/private/news/${id}`} className="btn btn-outline-primary">Read more...</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserNewsCard;