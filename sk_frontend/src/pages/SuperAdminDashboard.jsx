import React, { useState, useEffect } from "react";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCompany, setSelectedCompany] = useState(null); 

  const API_URL = "https://skilledlink-f4lp.onrender.com"; // ✅ Apna live backend URL

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/companies`, getAuthHeader());
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (companyId, companyName) => {
    const creditsInput = prompt(`How many credits to add for ${companyName}?`);
    if (!creditsInput || isNaN(creditsInput)) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/add-credits`, 
        { companyId, creditsToAdd: creditsInput },
        getAuthHeader()
      );
      alert(response.data.message);
      fetchCompanies(); 
    } catch (error) {
      alert("Failed to add credits.");
    }
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center", fontSize: "20px" }}>Loading System Core... ⏳</div>;

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8faff", fontFamily: "Inter, sans-serif" }}>
      
      {/* ⬛ SIDEBAR */}
      <div style={{ width: "250px", backgroundColor: "#1e293b", color: "white", padding: "20px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "40px", color: "#a78bfa" }}>👑 System Core</h2>
        <button 
          onClick={() => setActiveTab("companies")}
          style={{ padding: "12px", textAlign: "left", background: activeTab === "companies" ? "#334155" : "transparent", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
        >
          🏢 Companies
        </button>
      </div>

      {/* ⬜ MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto", position: "relative" }}>
        
        {activeTab === "companies" && (
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Registered Companies</h2>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#475569" }}>
                  <th style={{ padding: "15px" }}>Company Name</th>
                  <th style={{ padding: "15px" }}>Credits</th>
                  <th style={{ padding: "15px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(companies) && companies.length > 0 ? (
                  companies.map((comp) => (
                    <tr key={comp._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "15px", fontWeight: "bold", color: "#1e293b" }}>{comp.companyName || comp.name || "Unknown"}</td>
                      <td style={{ padding: "15px", fontWeight: "bold", color: comp.credits > 10 ? "#10b981" : "#ef4444" }}>
                        {comp.credits || 0} 🪙
                      </td>
                      <td style={{ padding: "15px", display: "flex", gap: "10px" }}>
                        <button 
                          onClick={() => setSelectedCompany(comp)}
                          style={{ background: "#f3f4f6", color: "#374151", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          👁️ View Details
                        </button>
                        <button 
                          onClick={() => handleAddCredits(comp._id, comp.companyName || comp.name)}
                          style={{ background: "#e0e7ff", color: "#4338ca", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          + Add Credits
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: "20px", textAlign: "center", color: "#ef4444", fontWeight: "bold" }}>
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 THE ULTIMATE COMPANY DETAILS MODAL (POPUP) 🚀 */}
      {selectedCompany && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          
          {/* Maine width 400px se 650px kar di hai taaki data acha dikhe */}
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#1e293b", fontSize: "24px" }}>
                🏢 {selectedCompany.companyName || selectedCompany.name || "Company Profile"}
              </h2>
              <span style={{ background: selectedCompany.isActive ? "#dcfce7" : "#fee2e2", color: selectedCompany.isActive ? "#166534" : "#991b1b", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                {selectedCompany.isActive ? "🟢 Active" : "🔴 Inactive"}
              </span>
            </div>

            {/* 🟢 GRID LAYOUT FOR DETAILS 🟢 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              
              {/* COLUMN 1: Business Details */}
              <div style={{ background: "#f8faff", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", color: "#4338ca", margin: "0 0 10px 0" }}>💼 Business Info</h3>
                <div style={{ marginBottom: "8px" }}><strong>Industry:</strong> {selectedCompany.industry || "N/A"}</div>
                <div style={{ marginBottom: "8px" }}><strong>Team Size:</strong> {selectedCompany.companySize ? `${selectedCompany.companySize} Employees` : "N/A"}</div>
                <div style={{ marginBottom: "8px" }}><strong>Location:</strong> {selectedCompany.location || "N/A"}</div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Website:</strong> {selectedCompany.website ? <a href={selectedCompany.website} target="_blank" rel="noreferrer" style={{color: "#3b82f6", textDecoration: "none"}}>Visit Link ↗</a> : "N/A"}
                </div>
              </div>

              {/* COLUMN 2: HR Contact */}
              <div style={{ background: "#f8faff", padding: "15px", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", color: "#4338ca", margin: "0 0 10px 0" }}>👤 HR Contact</h3>
                <div style={{ marginBottom: "8px" }}><strong>HR Name:</strong> {selectedCompany.hrName || "N/A"}</div>
                <div style={{ marginBottom: "8px" }}><strong>Email:</strong> <a href={`mailto:${selectedCompany.hrEmail || selectedCompany.email}`} style={{color: "#3b82f6", textDecoration: "none"}}>{selectedCompany.hrEmail || selectedCompany.email}</a></div>
                <div style={{ marginBottom: "8px" }}><strong>Phone:</strong> {selectedCompany.hrPhone || "N/A"}</div>
              </div>

            </div>

            {/* FULL WIDTH ROW: Description & System Status */}
            <div style={{ marginBottom: "20px" }}>
              <strong>Description:</strong> 
              <p style={{ color: "#475569", fontSize: "14px", marginTop: "5px", background: "#f1f5f9", padding: "10px", borderRadius: "6px" }}>
                {selectedCompany.description || "No description provided by the company."}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "15px", borderRadius: "8px", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Platform Verification</span>
                <strong>{selectedCompany.isApproved ? "✅ Approved" : "⏳ Pending Approval"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Joined On</span>
                <strong>{selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Wallet Balance</span>
                <strong style={{ color: selectedCompany.credits > 0 ? "#10b981" : "#ef4444", fontSize: "18px" }}>
                  {selectedCompany.credits || 0} 🪙
                </strong>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setSelectedCompany(null)} 
                style={{ flex: 1, background: "#ef4444", color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;