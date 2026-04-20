import { Link } from "react-router-dom";

function CityCard({cityObj}) {

    const { city, id } = cityObj

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{city}</h5>
                    <h5 className="card-text m-0">{id}</h5>
                        <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                            <Link to={`/cities/view/${id}`} className="btn btn-outline-primary">View</Link>
                            <Link to={`/cities/edit/${id}`} className="btn btn-outline-warning">Edit</Link>
                            <Link to={`/cities/delete/${id}`} className="btn btn-outline-danger">Delete</Link>
                        </div>
                </div>
            </div>
        </>
    )
}

export default CityCard;