import { Link } from "react-router-dom";

function FavoriteCard({ favoriteGroup }) {

    const { user_name, favorites } = favoriteGroup

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <div className="mb-4">
                        <h5 className="card-title card-header bg-secondary-subtle mb-0 ps-0 h2">{user_name}</h5>
                    </div>
                    <div className="d-flex flex-column gap-3">
                        {favorites.map((favorite) => {
                            return (
                                <div key={favorite.id} className="d-flex flex-column flex-sm-row gap-3 justify-content-between align-items-sm-center border-top pt-3">
                                    <div className="fs-5 fw-semibold">{favorite.place_name}</div>
                                    <div className="d-grid d-sm-flex gap-2">
                                        <Link to={`/favorites/view/${favorite.id}`} className="btn btn-outline-primary">View</Link>
                                        <Link to={`/favorites/edit/${favorite.id}`} className="btn btn-outline-warning">Edit</Link>
                                        <Link to={`/favorites/delete/${favorite.id}`} className="btn btn-outline-danger">Delete</Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default FavoriteCard;
