const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function getAdminPets() {
    const token = localStorage.getItem("tokenAdmin");
    const response = await fetch(`${backendUrl}/api/pets`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to fetch pets");
    return response.json();
}

export async function deletePetAdmin(petId) {
    const token = localStorage.getItem("tokenAdmin");
    const response = await fetch(`${backendUrl}/api/pets/${petId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to delete pet");
    return response.json();
}

export async function updatePetAdmin(petId, payload) {
    const token = localStorage.getItem("tokenAdmin");
    const response = await fetch(`${backendUrl}/api/pets/${petId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Failed to update pet");
    return response.json();
}
