import { Link } from "react-router-dom";

function PlaceCard({ placeObj }) {
    const { name, pet_rules, city, establishment_type, id, image_url, address } = placeObj

    const establishmentTypeEmoji = {
        bar: "\u{1F37A}",
        restaurant: "\u{1F35D}",
        cafe: "\u{2615}"
    }

    return (
        <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>

            {image_url && (
                <img
                    src={image_url}
                    className="card-img-top"
                    alt={name}
                    style={{ height: "260px", objectFit: "cover" }}
                />
            )}

            <div className="card-body">
                <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{name}</h5>

                <h6 className="card-subtitle mb-2 text-body-secondary">
                    {establishmentTypeEmoji[establishment_type]}
                    <span className="fst-italic">{establishment_type.toUpperCase()}</span>
                </h6>

                <div className="mb-3 d-flex flex-wrap gap-2">
                    {"\u{1F4CC}"}{address} ({city.city})
                </div>

                <div className="d-flex flex-column gap-3">
                    <p className="card-text m-0">{pet_rules}</p>

                    <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                        <Link to={`/places/view/${id}`} className="btn btn-outline-primary">View</Link>
                        <Link to={`/places/edit/${id}`} className="btn btn-outline-warning">Edit</Link>
                        <Link to={`/places/delete/${id}`} className="btn btn-outline-danger">Delete</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceCard;