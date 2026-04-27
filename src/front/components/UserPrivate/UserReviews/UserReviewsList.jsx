import { useEffect, useState } from "react";
import UserReviewCard from "./UserReviewCard";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserReviewsList() {
    // const [reviews, setReviews] = useState([]);
    const { store, dispatch } = useGlobalReducer();
    const reviews = store.privateUser.reviews || []
    

    // useEffect(() => {
    //     async function getPrivateUserReviews() {
    //         try {
    //             const userToken = localStorage.getItem("userToken");
    //             if (!userToken) {
    //                 return;
    //             }

    //             const response = await fetch(`${backendUrl}/api/users/private/reviews`, {
    //                 headers: {
    //                     Authorization: `Bearer ${userToken}`
    //                 }
    //             });

    //             if (!response.ok) {
    //                 throw new Error(`Reviews request failed with status ${response.status}`);
    //             }

    //             const privateReviews = await response.json();
    //             setReviews(privateReviews);
    //         } catch (error) {
    //             console.error("Unable to load private reviews:", error);
    //         }
    //     }

    //     getPrivateUserReviews();
    // }, []);

    useEffect(() => {
        async function getPrivateUser() {
            // if (store.privateUser?.id) {
            //     return;
            // }

            try {
                const userToken = localStorage.getItem("userToken");

                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        getPrivateUser();
    }, [dispatch, store.privateUser?.id]);

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
