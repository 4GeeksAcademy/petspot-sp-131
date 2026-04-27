import { useEffect, useState } from "react";
import UserReviewCard from "./UserReviewCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserReviewsList() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        async function getPrivateUserReviews() {
            try {
                const userToken = localStorage.getItem("userToken");
                if (!userToken) {
                    return;
                }

                const response = await fetch(`${backendUrl}/api/users/private/reviews`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Reviews request failed with status ${response.status}`);
                }

                const privateReviews = await response.json();
                setReviews(privateReviews);
            } catch (error) {
                console.error("Unable to load private reviews:", error);
            }
        }

        getPrivateUserReviews();
    }, []);

    return (
        <>
            {reviews.length > 0
                ? reviews.map((review) => {
                    return <UserReviewCard reviewObj={review} key={review.id} />;
                })
                : (
                    <p className="text-center">No reviews yet</p>
                )}
        </>
    );
}

export default UserReviewsList;
