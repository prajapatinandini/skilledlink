import React, { useState, useEffect } from "react";
import "../styles/companyProfile.css";

const CompanyProfileCreate = () => {
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    industry: "",
    location: "",
    companySize: "",
    hrName: "",
    hrEmail: "",
    hrPhone: "",
    hiringRoles: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch user + profile
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // 🔹 1. Get user
        const userRes = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let userData = {};
        if (userRes.ok) {
          userData = await userRes.json();
        }

        // 🔹 2. Get company profile
        const profileRes = await fetch(
          "http://localhost:5000/api/company/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let profileData = {};
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }

        // 🔹 3. Merge data
        setForm({
          companyName: profileData.companyName || userData.companyName || "",
          website: profileData.website || "",
          industry: profileData.industry || "",
          location: profileData.location || "",
          companySize: profileData.companySize || "",
          hrName: profileData.hrName || "",
          hrEmail: profileData.hrEmail || userData.email || "",
          hrPhone: profileData.hrPhone || "",
          hiringRoles: profileData.hiringRoles?.join(", ") || "",
        });

      } catch (err) {
        console.log("Error loading data", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "companySize" ? Number(value) : value,
    });
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate hiringRoles string format
    const formattedRoles = form.hiringRoles
      ? form.hiringRoles.split(",").map(role => role.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(
        "http://localhost:5000/api/company/create-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...form,
            hiringRoles: formattedRoles,
            // 🚨 FIX: Yeh sab strictly 'body' ke andar hain!
            allowedLanguages: ["js", "cpp"],
            evaluationFormula: {
              aptitude: 40,
              coding: 40,
              github: 20,
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Agar API ne error return kiya toh use dikhao
        alert("Error: " + (data.message || "Failed to save profile."));
        setLoading(false);
        return;
      }

      console.log("Profile Saved:", data);
      alert(data.message || "Profile saved successfully! Redirecting...");

      // 🚨 100% GUARANTEED HARD REDIRECT
      // Note: Make sure the path matches your App.js route for the company dashboard
      window.location.href = "/company/dashboard"; 

    } catch (err) {
      console.error("Submit error", err);
      alert("Network error or server is down!");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-left">
        <div className="left-content">
          <img
            src="/login-illustration2.png"
            className="login-illustration"
            alt="illustration"
          />
          <h1 className="brand-name">SkillLink</h1>
        </div>
      </div>

      <div className="login-right">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>Create Company Profile</h2>

          <input
            name="companyName"
            placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
          />

          <input
            name="website"
            placeholder="Website"
            value={form.website}
            onChange={handleChange}
          />

          <input
            name="industry"
            placeholder="Industry"
            value={form.industry}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />

          {/* ✅ DROPDOWN */}
          <select
            name="companySize"
            value={form.companySize || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select Company Size</option>
            <option value={10}>1-10</option>
            <option value={50}>11-50</option>
            <option value={200}>51-200</option>
            <option value={500}>201-500</option>
            <option value={1000}>501-1000</option>
            <option value={5000}>1000+</option>
          </select>

          <input
            name="hrName"
            placeholder="HR Name"
            value={form.hrName}
            onChange={handleChange}
            required
          />

          <input
            name="hrEmail"
            type="email"
            placeholder="HR Email"
            value={form.hrEmail}
            onChange={handleChange}
            required
          />

          <input
            name="hrPhone"
            placeholder="HR Phone"
            value={form.hrPhone}
            onChange={handleChange}
            required
          />

          <input
            name="hiringRoles"
            placeholder="Hiring Roles (e.g. Developer, Designer)"
            value={form.hiringRoles}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving..." : (form.website ? "Update Profile" : "Create Profile")}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CompanyProfileCreate;