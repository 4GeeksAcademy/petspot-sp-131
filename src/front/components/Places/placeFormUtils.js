export const DEFAULT_PLACE_THUMBNAILS = {
    bar: "https://images.unsplash.com/photo-1659514149185-e8f007131309?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    restaurant: "https://images.unsplash.com/photo-1755632540801-8eaf8eb22e1d?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cafe: "https://images.unsplash.com/photo-1571168136613-46401b03904e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
};

export function getDefaultPlaceThumbnail(establishmentType) {
    return DEFAULT_PLACE_THUMBNAILS[establishmentType] || "";
}