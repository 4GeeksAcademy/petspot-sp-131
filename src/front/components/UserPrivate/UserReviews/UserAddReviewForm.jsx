import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserAddReviewForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [reservation, setReservation] = useState(store.privateUser?.reservations?.find((reservation) => reservation.id === Number(id)) || null);

    
    // useEffect(() => {
    //     async function getReservation() {
    //         try {
        //             const response = await fetch(`${backendUrl}/api/reservations/${id}`);
        //             if (!response.ok) {
            //                 throw new Error(`Reservation request failed with status ${response.status}`);
    //             }
    
    //             const reservationData = await response.json();
    //             setReservation(reservationData);
    //         } catch (error) {
        //             console.error("Unable to load reservation:", error);
    //         }
    //     }

    //     getReservation();
    // }, [id]);

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                return;
            }

            try {
                const responseJSON = await getPrivateUser();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });

            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }
        
        loadPrivateUser();
    }, [dispatch, store.privateUser?.id]);


    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!rating || !trimmedTitle || !trimmedContent) {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        try {
            const userToken = localStorage.getItem("userToken");
            const response = await fetch(`${backendUrl}/api/users/private/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    reservation_id: id.toString(),
                    rating: rating.toString(),
                    title: trimmedTitle,
                    content: trimmedContent
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const backendMessage = errorData.response || errorData.message || "Unknown backend error";
                alert(`Error ${response.status}: ${backendMessage}`);
                return;
            }

            navigate("/user/private/reviews");
        } catch (error) {
            alert("Unable to add the review right now. Please try again.");
        }
    }

    return (
        <>
            <div className="text-center my-5">
                <Link to="/user/private/reservations" className="btn btn-secondary">
                    Go Back to Reservations
                </Link>
            </div>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <h1 className="text-center mb-4 display-6">Write a Review</h1>
                <div className="mb-3">
                    <label className="form-label">Place</label>
                    <input
                        type="text"
                        className="form-control"
                        value={reservation ? reservation.place_name : `Reservation #${id}`}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="rating" className="form-label">Rating *</label>
                    <select id="rating" className="form-select" value={rating} onChange={(event) => setRating(event.target.value)} required>
                        <option value="">Select a rating</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input id="title" type="text" className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Review *</label>
                    <textarea id="content" className="form-control" value={content} onChange={(event) => setContent(event.target.value)} required></textarea>
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
                </div>
            </form>
        </>
    );
}

export default UserAddReviewForm;
