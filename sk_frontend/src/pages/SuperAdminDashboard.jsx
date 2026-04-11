import React, { useState, useEffect } from "react";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ Apne backend ka URL yahan set karein
  const API_URL = "https://skilledlink-f4lp.onrender.com"; 

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  // 🚀 1. REAL DATA FETCH KARNA
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
      alert("Failed to load companies data.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 2. REAL CREDITS ADD KARNA
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
      fetchCompanies(); // Data update hone ke baad table refresh karo
    } catch (error) {
      console.error("Error adding credits:", error);
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
          style={{ padding: "12px", textAlign: "left", background: activeTab === "companies" ? "#334155" : "transparent", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "10px", fontSize: "16px" }}
        >
          🏢 Companies
        </button>
      </div>

      {/* ⬜ MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        
        {activeTab === "companies" && (
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Registered Companies</h2>

            {companies.length === 0 ? (
              <p>No companies found in database.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", color: "#475569" }}>
                    <th style={{ padding: "15px" }}>Company Name</th>
                    <th style={{ padding: "15px" }}>Email ID</th>
                    <th style={{ padding: "15px" }}>Credits Left</th>
                    <th style={{ padding: "15px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((comp) => (
                    <tr key={comp._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      {/* Name property aapke User schema ke hisaab se adjust kar lena */}
                      <td style={{ padding: "15px", fontWeight: "bold", color: "#1e293b" }}>{comp.name || comp.companyName || "Unknown"}</td>
                      <td style={{ padding: "15px", color: "#64748b" }}>{comp.email}</td>
                      <td style={{ padding: "15px", fontWeight: "bold", color: comp.credits > 10 ? "#10b981" : "#ef4444" }}>
                        {comp.credits || 0} 🪙
                      </td>
                      <td style={{ padding: "15px" }}>
                        <button 
                          onClick={() => handleAddCredits(comp._id, comp.name || comp.email)}
                          style={{ background: "#e0e7ff", color: "#4338ca", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          + Add Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdminDashboard;