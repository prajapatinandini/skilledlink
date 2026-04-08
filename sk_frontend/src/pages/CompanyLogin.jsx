import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/companyLogin.css";

const API_URL = "https://skilledlink-f4lp.onrender.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const getInitialAnim = () => {
    const from = sessionStorage.getItem("cl-auth-from");
    if (from === "register") {
      sessionStorage.removeItem("cl-auth-from");
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
    sessionStorage.setItem("cl-auth-from", "login");
    setAnimClass("slide-out-to-left");
    setTimeout(() => navigate("/register/company"), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        // 👇 YEH RAHI HAMARI JAADOO KI PUDIYA (CORS FIX) 👇
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      console.log(res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 👈 NAYA LOGIC: App.jsx wale exact rasto se match kiya
      if (res.data.role === "company") {
        if (res.data.isProfileComplete) {
          // Profile poori hai -> Seedha Dashboard
          navigate("/company/dashboard"); // ✅ FIXED
        } else {
          // Profile adhoori hai -> Profile Setup page 
          navigate("/company/create-profile"); // ✅ FIXED
        }
      } else {
        navigate("/student"); 
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={`login-container ${animClass}`}>

      <div className="login-left">
        <div className="left-content">
          <img
            src="/login-illustration2.png"
            alt="Login Illustration"
            className="login-illustration"
          />
          <h1 className="brand-name">SkilledLink</h1>
        </div>
      </div>

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
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password', { state: { role: 'company' } }); }}>
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