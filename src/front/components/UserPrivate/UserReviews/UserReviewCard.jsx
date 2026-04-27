function UserReviewCard({ reviewObj }) {
    const {
        place_name,
        rating,
        title,
        content,
        created_at
    } = reviewObj;

    return (
        <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
            <div className="card-body">
                <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{place_name}</h5>
                <div className="mb-3">
                    <strong>Rating:</strong> {rating}/5
                </div>
                <div className="mb-3">
                    <strong>Title:</strong> {title}
                </div>
                <div className="mb-3">
                    <strong>Review:</strong> {content}
                </div>
                <div className="mb-0">
                    <strong>Created at:</strong> {created_at}
                </div>
            </div>
        </div>
    );
}

export default UserReviewCard;
