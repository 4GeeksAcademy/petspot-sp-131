import { PayPalButtons } from "@paypal/react-paypal-js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PayPalPayment({ reservationId, amount, currency, onSuccess }) {
    async function createOrder() {
        const userToken = localStorage.getItem("userToken");

        const response = await fetch(`${backendUrl}/api/users/private/paypal/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({
                reservation_id: reservationId
            })
        });

        const responseJSON = await response.json();

        if (!response.ok) {
            throw new Error(responseJSON.response || "Unable to create PayPal order");
        }

        return responseJSON.orderID;
    }

    async function handleApprove(data) {
        const userToken = localStorage.getItem("userToken");

        const response = await fetch(`${backendUrl}/api/users/private/paypal/capture-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({
                reservation_id: reservationId,
                order_id: data.orderID
            })
        });

        const responseJSON = await response.json();

        if (!response.ok) {
            throw new Error(responseJSON.response || "Unable to confirm PayPal payment");
        }

        if (onSuccess) {
            await onSuccess(responseJSON);
        }
    }

    return (
        <div className="mt-4 p-4 rounded-4 bg-white border border-light shadow-sm">
            <p className="mb-2 fw-bold text-primary">Reservation created. Complete payment to confirm it.</p>
            <p className="mb-4 text-muted">Amount due: {amount} {currency}</p>
            <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={handleApprove}
                onError={(error) => {
                    alert(error?.message || "PayPal payment failed. Please try again.");
                }}
            />
        </div>
    );
}

export default PayPalPayment;
