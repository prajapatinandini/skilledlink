import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/studentRegister.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // animation
  const getInitialAnim = () => {
    const from = sessionStorage.getItem("sl-auth-from");
    if (from === "login") {
      sessionStorage.removeItem("sl-auth-from");
      return "slide-in-from-right";
    }
    return "";
  };

  const [animClass, setAnimClass] = useState(getInitialAnim);

  useEffect(() => {
    if (animClass === "slide-in-from-right") {
      const t = setTimeout(() => setAnimClass(""), 600);
      return () => clearTimeout(t);
    }
  }, [animClass]);

  const handleLogin = (e) => {
    e.preventDefault();
    sessionStorage.setItem("sl-auth-from", "register");
    setAnimClass("slide-out-to-right");
    setTimeout(() => navigate("/login/student"), 500);
  };

  // ✅ REGISTER API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
          role: "student",
        }
      );

      alert(res.data.message);

      // go to OTP page
      navigate("/verify-otp", {
        state: { email },
      });

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Register failed"
      );
    }
  };

  return (
    <div className={`register-container ${animClass}`}>

      {/* LEFT SIDE */}
      <div className="register-left">
        <form className="register-box" onSubmit={handleSubmit}>
          <h2>SkillLink Register</h2>
          <p>Create your SkillLink account</p>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button type="submit">Register</button>

          <div className="extra-links">
            <a href="#" onClick={handleLogin}>
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        <div className="right-content">
          <img
            src="/register-illustration.png"
            alt="Register Illustration"
            className="register-illustration"
          />
          <h1 className="brand-name">SkillLink</h1>
        </div>
      </div>

    </div>
  );
};

export default Register;