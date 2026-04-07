import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/companyRegister.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Register = () => {

  const [name, setName] = useState("");
  const [companySize, setCompanySize] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();


  // animation
  const getInitialAnim = () => {
    const from = sessionStorage.getItem("cl-auth-from");
    if (from === "login") {
      sessionStorage.removeItem("cl-auth-from");
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


  // go login
  const handleLogin = (e) => {
    e.preventDefault();
    sessionStorage.setItem("cl-auth-from", "register");
    setAnimClass("slide-out-to-right");
    setTimeout(() => navigate("/login/company"), 500);
  };


  // ✅ UPDATED REGISTER API (2-Step Flow for Company)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      // 1. Backend ko SIRF email bhejo OTP bhejne ke liye
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        { email } // 👈 Sirf email bhej rahe hain
      );

      alert(res.data.message);

      // 2. MAGIC: Dusre page par jao, aur saari Company Details bag mein le jao
      navigate("/verify-otp", {
        state: { 
          name, 
          email, 
          password, 
          role: "company", 
          companyName: name, 
          companySize: companySize 
        }
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

      {/* LEFT SIDE – FORM */}
      <div className="register-left">

        <form
          className="register-box"
          onSubmit={handleSubmit}
        >

          <h2>SkilledLink Register</h2>
          <p>Create your SkilledLink account</p>


          <input
            type="text"
            placeholder="Company Name"
            className="register-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />


          <select
            className="register-input"
            value={companySize}
            onChange={(e) =>
              setCompanySize(e.target.value)
            }
          >
            <option value="">
              Company Size
            </option>

            <option value="5-10">
              5 - 10
            </option>

            <option value="10-50">
              10 - 50
            </option>

            <option value="100-1000">
              100 - 1000
            </option>

            <option value="1000+">
              1000+
            </option>

          </select>


          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
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


          <button type="submit">
            Register
          </button>


          <div className="extra-links">
            <a
              href="#"
              onClick={handleLogin}
            >
              Already have an account? Login
            </a>
          </div>

        </form>

      </div>


      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="right-content">

          <img
            src="/register-illustration2.png"
            alt="Register Illustration"
            className="register-illustration"
          />

          <h1 className="brand-name">
            SkilledLink
          </h1>

        </div>

      </div>

    </div>
  );
};

export default Register;