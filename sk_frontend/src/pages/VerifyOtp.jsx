import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/verifyOtp.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // 👈 NAYA: Pichle page se bheja gaya pura data (bag) nikal liya
  const userData = location.state;

  // Ek chhota sa check: Agar koi direct URL daal kar is page par aa jaye, toh usko wapas register pe bhej do
  useEffect(() => {
    if (!userData || !userData.email) {
      navigate("/register"); // Aap apne register page ka path daal dijiyega agar alag hai
    }
  }, [userData, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      // 👈 NAYA: Ab API ko sirf email nahi, balki saara data aur OTP ek saath dena hai
      const res = await axios.post(
        `${API_URL}/api/auth/verify-otp`, // Make sure aapka backend route exactly yahi ho (verifyOtp ya verify-otp)
        {
          ...userData, // Yeh line name, email, password, role sab daal degi
          otp: otp,
        }
      );

      alert(res.data.message); // "Account verified and created successfully"

      navigate("/login/student");

    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="register-container">

      <div className="register-left">

        <form
          className="register-box"
          onSubmit={handleVerify}
        >

          <h2>Verify OTP</h2>
          <p>Enter OTP sent to email</p>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
          />

          <button type="submit">
            Verify
          </button>

        </form>

      </div>

      <div className="register-right">
        <div className="right-content">

          <img
            src="/register-illustration.png"
            className="register-illustration"
            alt="Illustration"
          />

          <h1 className="brand-name">
            SkilledLink
          </h1>

        </div>
      </div>

    </div>
  );
};

export default VerifyOtp;