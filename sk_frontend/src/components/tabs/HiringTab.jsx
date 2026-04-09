import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "https://skilledlink-f4lp.onrender.com";

// 🚀 1. UPDATE: DurationBadge mein Expired ka logic laga diya
const DurationBadge = ({ daysLeft }) => {
  if (daysLeft <= 0) {
    return (
      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", border: "1px solid #fca5a5" }}>
        🔴 Expired / Closed
      </span>
    );
  }
  return (
    <span style={{ background: "#e6f7ff", color: "#1890ff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
      ⏳ {daysLeft} Days Left
    </span>
  );
};

const HiringTab = ({ onOpenHistory }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 REAL API CALL (Fetch Jobs from DB)
  // ==========================================
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/jobs/all`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        setJobs(res.data.jobs || res.data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 🚀 2. UPDATE: Paused YA Expired jobs ko neeche bhejna
  const sortedJobs = [...jobs].sort((a, b) => {
    const aIsInactive = a.isPaused || a.daysLeft <= 0;
    const bIsInactive = b.isPaused || b.daysLeft <= 0;
    return aIsInactive === bIsInactive ? 0 : aIsInactive ? 1 : -1;
  });

  if (loading) {
    return <div className="content-box" style={{ textAlign: "center", padding: "40px", color: "#553f9a", fontWeight: "bold" }}>Loading open positions... ⏳</div>;
  }

  return (
    <div className="content-box">
      <h2>Open Positions</h2>
      {sortedJobs.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No jobs posted yet. They will appear here once you create them!</p>
      ) : (
        sortedJobs.map(job => {
          // 🚀 3. UPDATE: Agar days 0 hain toh usey paused maan lenge visuals ke liye
          const paused = job.isPaused || job.daysLeft <= 0; 

          return (
            <div
              key={job._id || job.id} 
              className="job-card"
              style={{
                opacity: paused ? 0.55 : 1,
                background: paused ? "#f5f5f7" : "#fff",
                transition: "opacity 0.3s, background 0.3s",
                position: "relative",
                border: "1px solid #e0d9f5",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
              }}
            >
              {paused && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "12px",
                  background: "repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(0,0,0,0.015) 8px,rgba(0,0,0,0.015) 16px)",
                  pointerEvents: "none"
                }} />
              )}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "14px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, color: paused ? "#9ca3af" : "#2d1f6e", fontSize: "20px" }}>{job.title}</h3>
                  {job.isPaused && job.daysLeft > 0 && (
                    <span style={{
                      background: "#e5e7eb",
                      color: "#4b5563",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: "20px"
                    }}>
                      ⏸ Paused
                    </span>
                  )}
                </div>
                {/* 🚀 4. UPDATE: Badge ab har condition mein render hoga (Pause ho ya na ho) */}
                {job.daysLeft !== undefined && <DurationBadge daysLeft={job.daysLeft} />}
              </div>
              
              <div className="job-meta" style={{ display: "flex", gap: "20px", marginBottom: "12px", fontSize: "14px", color: "#4b5563" }}>
                <span><strong>Experience:</strong> {job.experience || "Not specified"}</span>
                <span><strong>Salary:</strong> {job.salary || "Not specified"}</span>
              </div>
              
              <p style={{ margin: "0 0 16px 0", color: "#374151", fontSize: "14px", lineHeight: "1.5" }}>
                <strong>Description:</strong> {job.description || "No description provided."}
              </p>
              
              <div style={{ marginBottom: "12px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ fontSize: "14px", color: "#374151" }}>Skills:</strong>{" "}
                {(job.skills || []).map((s, i) => (
                  <span key={i} style={{ background: "#f3f0ff", color: "#553f9a", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>{s}</span>
                ))}
              </div>
              
              {(job.languages || []).length > 0 && (
                <div style={{ marginBottom: "20px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "14px", color: "#374151" }}>Languages:</strong>{" "}
                  {job.languages.map((l, i) => (
                    <span key={i} style={{ background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>{l}</span>
                  ))}
                </div>
              )}
              
              <div className="job-card-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
                <button
                  className="history-btn job-card-actions-right"
                  onClick={() => onOpenHistory(job)}
                  style={{
                    background: "#553f9a",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(85,63,154,0.2)",
                    position: "relative",
                    zIndex: 10 
                  }}
                >
                  📋 View Applicants History
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default HiringTab;