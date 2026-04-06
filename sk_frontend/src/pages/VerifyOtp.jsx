import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/verifyOtp.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      alert(res.data.message);

      navigate("/login/student");

    } catch (err) {
      alert(err.response?.data?.message);
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
          />

          <h1 className="brand-name">
            SkillLink
          </h1>

        </div>
      </div>

    </div>
  );
};

export default VerifyOtp;