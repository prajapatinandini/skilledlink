import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/studentLogin.css";
const API_URL = "https://skilledlink-f4lp.onrender.com" || "http://localhost:5000";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // animation
  const getInitialAnim = () => {
    const from = sessionStorage.getItem("sl-auth-from");
    if (from === "register") {
      sessionStorage.removeItem("sl-auth-from");
      return "slide-in-from-left";
    }
    return "";
  };

  const [animClass, setAnimClass] = useState(getInitialAnim);

  useEffect(() => {
    if (animClass === "slide-in-from-left") {
      const t = setTimeout(() => setAnimClass(""), 600);
      return () => clearTimeout(t);
    }
  }, [animClass]);

  const handleSignUp = (e) => {
    e.preventDefault();
    sessionStorage.setItem("sl-auth-from", "login");
    setAnimClass("slide-out-to-left");
    setTimeout(() => navigate("/register/student"), 500);
  };

  // ✅ LOGIN API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
          role: "student",
        }
      );

      alert(res.data.message);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 🚨 FIX: Redirect directly to Dashboard
      // Wahan Dashboard khud decide karega ki profile setup karni hai ya seedha Jobs dikhani hain
      if (res.data.role === "student") {
        navigate("/student"); // ✅ Sahi Redirect
      }

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className={`login-container ${animClass}`}>

      {/* LEFT HALF */}
      <div className="login-left">
        <div className="left-content">
          <img
            src="/login-illustration.png"
            alt="Login Illustration"
            className="login-illustration"
          />
          <h1 className="brand-name">SkilledLink</h1>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="login-right">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>SkilledLink Login</h2>
          <p>Welcome back! Please login to your account</p>

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

          <button type="submit">Login</button>

          <div className="extra-links">
  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
    Forgot Password?
  </a>
  <span> | </span>
  <a href="#" onClick={handleSignUp}>
    Sign Up
  </a>
</div>
        </form>
      </div>

    </div>
  );
};

export default Login;