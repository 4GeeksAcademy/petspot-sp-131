import { Link } from "react-router-dom";
import UserPetsList from "../../../components/UserPrivate/UserPets/UserPetsList";

function UserPets() {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h5 style={{ fontWeight: 700, color: "var(--admin-text)", margin: 0 }}>
                    <i className="fa-solid fa-paw me-2" style={{ color: "var(--admin-primary)" }} />
                    Mis mascotas
                </h5>
                <Link to="/user/private/pets/add" style={{
                    background: "var(--admin-primary)", color: "#fff", border: "none",
                    borderRadius: "var(--admin-radius-sm)", padding: "7px 16px",
                    fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 6,
                }}>
                    <i className="fa-solid fa-plus" /> Añadir mascota
                </Link>
            </div>
            <UserPetsList />
        </div>
    );
}

export default UserPets;
