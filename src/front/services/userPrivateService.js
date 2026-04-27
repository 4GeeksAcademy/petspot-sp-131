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
        throw new Error(`Request failed with status ${response.status}`);
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
