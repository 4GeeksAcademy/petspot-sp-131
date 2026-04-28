import { Link } from "react-router-dom";

const OTHER_PET_FALLBACK_IMAGE = "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const animalTypeLabel = {
    dog: "Dog",
    cat: "Cat",
    other: "Other"
};

const sizeLabel = {
    small: "Small",
    medium: "Medium",
    large: "Large"
};

function UserPetCard({ petObj }) {
    const imageUrl = petObj.url || petObj.race_url || (petObj.animal_type === "other" ? OTHER_PET_FALLBACK_IMAGE : null);
    const animalTypeName = petObj.animal_type === "other"
        ? (petObj.other_type || animalTypeLabel.other)
        : (animalTypeLabel[petObj.animal_type] || petObj.animal_type);

    return (
        <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 400 }}>
            {imageUrl && (
                <img
                    src={imageUrl}
                    className="card-img-top"
                    alt={petObj.name}
                    style={{ height: "260px", objectFit: "cover" }}
                />
            )}
            <div className="card-body">
                <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{petObj.name}</h5>
                <div className="mb-3">
                    <strong>Type:</strong> {animalTypeName}
                </div>
                <div className="mb-3">
                    <strong>Breed:</strong> {petObj.race_name || "Mixed / Unspecified"}
                </div>
                <div className="mb-0">
                    <strong>Size:</strong> {sizeLabel[petObj.size] || petObj.size}
                </div>
                <div className="mt-4 d-grid d-sm-flex gap-2 justify-content-sm-end">
                    <Link to={`/user/private/pets/edit/${petObj.id}`} className="btn  btn-outline-success">
                        Edit
                    </Link>
                    <Link to={`/user/private/pets/delete/${petObj.id}`} className="btn  btn-outline-danger">
                        Delete
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default UserPetCard;
