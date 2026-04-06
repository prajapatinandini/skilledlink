import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/companyLogin.css";

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

  // ✅ LOGIN API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log(res.data);

      // save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 🚨 FIX: Redirect strictly to Dashboards matching App.jsx routes!
      if (res.data.role === "company") {
        navigate("/company/dashboard"); // ✅ YAHAN FIX KIYA HAI!
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
          <h1 className="brand-name">SkillLink</h1>
        </div>
      </div>

      <div className="login-right">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>SkillLink Login</h2>
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