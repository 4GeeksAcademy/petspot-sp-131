import React from "react";
import { useParams, Link } from "react-router-dom";
import AdminPetForm from "../../components/Pets/AdminPetForm";

const AdminEditPet = () => {
    const { id } = useParams();

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold text-dark">Edit Pet #{id}</h1>
                <Link to="/usuario/admin/pets" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    <i className="fa-solid fa-arrow-left me-2"></i>Back to List
                </Link>
            </div>
            
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <AdminPetForm petId={id} mode="edit" />
                </div>
            </div>
        </div>
    );
};

export default AdminEditPet;
