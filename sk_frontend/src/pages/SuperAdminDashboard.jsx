import React, { useState, useEffect } from "react";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCompany, setSelectedCompany] = useState(null); 

  const API_URL = "https://skilledlink.in"; // Live URL

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
      
      // 🕵️‍♀️ THE SPY: Ye console mein batayega ki backend aakhir bhej kya raha hai
      console.log("BACKEND KA RESPONSE:", response.data);
      
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
                {/* 🛡️ THE CRASH PREVENTER: Yahan humne check lagaya hai ki data Array hi ho */}
                {Array.isArray(companies) && companies.length > 0 ? (
                  companies.map((comp) => (
                    <tr key={comp._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "15px", fontWeight: "bold", color: "#1e293b" }}>{comp.name || comp.companyName || "Unknown"}</td>
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
                          onClick={() => handleAddCredits(comp._id, comp.name || comp.email)}
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
                      No companies found or invalid data received. Please check F12 Console.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🟢 COMPANY DETAILS MODAL (POPUP) 🟢 */}
      {selectedCompany && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>🏢 Company Profile</h2>
            <div style={{ marginBottom: "15px" }}><strong>Name:</strong> {selectedCompany.name || selectedCompany.companyName || "N/A"}</div>
            <div style={{ marginBottom: "15px" }}><strong>Email:</strong> <a href={`mailto:${selectedCompany.email}`} style={{color: "#4338ca"}}>{selectedCompany.email}</a></div>
            <div style={{ marginBottom: "15px" }}><strong>Phone:</strong> {selectedCompany.phone || "Not Provided"}</div>
            <div style={{ marginBottom: "15px" }}><strong>Location:</strong> {selectedCompany.location || "Not Provided"}</div>
            <div style={{ marginBottom: "15px" }}><strong>Joined On:</strong> {selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</div>
            <div style={{ marginBottom: "25px", fontSize: "18px" }}>
              <strong>Wallet Balance:</strong> <span style={{ color: selectedCompany.credits > 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>{selectedCompany.credits || 0} 🪙</span>
            </div>
            <button 
              onClick={() => setSelectedCompany(null)} 
              style={{ width: "100%", background: "#ef4444", color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;