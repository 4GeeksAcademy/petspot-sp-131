const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function getPrivateUser() {
    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
        return null;
    }

    const response = await fetch(`${backendUrl}/api/users/private`, {
        headers: {
            Authorization: `Bearer ${userToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`User request failed with status ${response.status}`);
    }

    return response.json();
}

export async function getPlaces() {
    const response = await fetch(`${backendUrl}/api/places`);

    if (!response.ok) {
        throw new Error(`Places request failed with status ${response.status}`);
    }

    return response.json();
}

export async function handleAddToFavorites(placeId) {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/users/private/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
            place_id: placeId.toString()
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log("FAVORITE ERROR:", errorData);
        throw new Error(errorData.msg || errorData.response || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export async function handleRemoveFromFavorites(placeId) {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/users/private/favorites`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
            place_id: placeId.toString()
        })
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return getPrivateUser();
}

export async function getUserPets() {
    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
        return [];
    }

    const response = await fetch(`${backendUrl}/api/users/pets`, {
        headers: {
            Authorization: `Bearer ${userToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Pets request failed with status ${response.status}`);
    }

    return response.json();
}

export async function getPetById(petId) {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/pets/${petId}`, {
        headers: {
            Authorization: `Bearer ${userToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Pet request failed with status ${response.status}`);
    }

    return response.json();
}

export async function getRaces() {
    const response = await fetch(`${backendUrl}/api/races`);

    if (!response.ok) {
        throw new Error(`Races request failed with status ${response.status}`);
    }

    return response.json();
}

export async function importRaces() {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/races/import`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
        }
    });

    const responseJSON = await response.json();

    if (!response.ok) {
        throw new Error(responseJSON.msg || `Races import failed with status ${response.status}`);
    }

    return responseJSON;
}

export async function uploadPetImage(imageFile) {
    if (!imageFile) {
        return null;
    }

    const userToken = localStorage.getItem("userToken");
    const uploadData = new FormData();
    uploadData.append("image", imageFile);

    const response = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${userToken}`
        },
        body: uploadData
    });

    const responseJSON = await response.json();

    if (!response.ok) {
        throw new Error(responseJSON.msg || `Image upload failed with status ${response.status}`);
    }

    return responseJSON.url;
}

export async function createPet(payload) {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/pets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
    });

    const responseJSON = await response.json();

    if (!response.ok) {
        throw new Error(responseJSON.msg || `Create pet failed with status ${response.status}`);
    }

    return responseJSON;
}

export async function updatePet(petId, payload) {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/pets/${petId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
    });

    const responseJSON = await response.json();

    if (!response.ok) {
        throw new Error(responseJSON.msg || `Update pet failed with status ${response.status}`);
    }

    return responseJSON;
}

export async function deletePet(petId) {
    const userToken = localStorage.getItem("userToken");

    const response = await fetch(`${backendUrl}/api/pets/${petId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${userToken}`
        }
    });

    const responseJSON = await response.json();

    if (!response.ok) {
        throw new Error(responseJSON.msg || `Delete pet failed with status ${response.status}`);
    }

    return responseJSON;
}
