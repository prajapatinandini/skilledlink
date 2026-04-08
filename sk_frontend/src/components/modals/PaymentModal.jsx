import React, { useState } from "react";
import axios from "axios";

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  // ✅ FIX 1: Using .env for API URL (Fallback to localhost for safety)
  
const API_URL = "https://skilledlink-f4lp.onrender.com";
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const handlePayment = async (amount, creditsToAdd) => {
    try {
      setLoading(true);

      const { data: order } = await axios.post(`${API_URL}/api/payment/create-order`, { amount }, getAuthHeader());

      const options = {
        // 🚨 FIX 2: Using .env for Razorpay Key ID
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "SkillEdLink",
        description: `Buy ${creditsToAdd} Credits`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post(`${API_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              creditsToAdd: creditsToAdd
            }, getAuthHeader());

            alert(`Success! ${creditsToAdd} credits added to your account.`);
            onSuccess(); // Close modal and let them apply
            onClose();
          } catch (err) {
            alert("Payment verification failed!");
          }
        },
        theme: { color: "#553f9a" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Failed to load payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div style={{ background: "#fff", padding: "30px", borderRadius: "15px", textAlign: "center", maxWidth: "500px", width: "90%" }}>
        <h2 style={{ color: "#dc2626", margin: "0 0 10px 0" }}>Insufficient Credits! 🪙</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>You need at least 10 credits to apply. Please recharge your account.</p>
        
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ border: "1.5px solid #ede8fb", padding: "20px", borderRadius: "10px", flex: 1, background: "#f8faff" }}>
            <h3 style={{ color: "#2d1f6e", margin: "0 0 5px 0" }}>Starter Pack</h3>
            <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#666" }}>100 Credits (10 Applies)</p>
            <button disabled={loading} onClick={() => handlePayment(99, 100)} style={{ background: "#553f9a", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
              Pay ₹99
            </button>
          </div>

          <div style={{ border: "1.5px solid #ede8fb", padding: "20px", borderRadius: "10px", flex: 1, background: "#fcfbff" }}>
            <h3 style={{ color: "#2d1f6e", margin: "0 0 5px 0" }}>Pro Pack</h3>
            <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#666" }}>250 Credits (25 Applies)</p>
            <button disabled={loading} onClick={() => handlePayment(199, 250)} style={{ background: "linear-gradient(135deg,#553f9a,#7b5fc4)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
              Pay ₹199
            </button>
          </div>
        </div>

        <button onClick={onClose} style={{ background: "transparent", color: "#666", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>
      </div>
    </div>
  );
};

export default PaymentModal;