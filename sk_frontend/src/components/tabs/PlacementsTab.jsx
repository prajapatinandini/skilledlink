import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlacementsTab = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  
const API_URL = "https://skilledlink-f4lp.onrender.com";
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 FETCH PLACEMENTS & THEIR PROFILES
  // ==========================================
  useEffect(() => {
    const fetchPlacementsData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        // 1. Get all placements
        const res = await axios.get(`${API_URL}/dashboard/placements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const rawPlacements = res.data || [];

        // 2. Fetch full profile data for each placed student to remove "N/A"
        const placementsWithProfiles = await Promise.all(
          rawPlacements.map(async (p) => {
            const studentId = p.student?._id || p.student;
            let profileData = {};
            
            if (studentId) {
              try {
                const portRes = await axios.get(`${API_URL}/dashboard/portfolio/${studentId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                profileData = portRes.data;
              } catch (err) {
                console.error(`Failed to fetch profile for ${studentId}`, err);
              }
            }

            // Fallback checking logic
            const st = p.student || {};
            const finalCollege = profileData.college && profileData.college !== "N/A" ? profileData.college : (st.college || "College not specified");
            const finalDegree = profileData.degree && profileData.degree !== "N/A" ? profileData.degree : (st.degree || "Degree not specified");
            const finalName = st.name || "Unknown Applicant";

            return {
              id: studentId,
              name: finalName,
              // 🟢 SMART AVATAR: Agar photo nahi hai ya URL invalid hai toh initials wala avatar
              img: st.img ? st.img : `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=f3f0ff&color=553f9a&bold=true`,
              college: finalCollege,
              degree: finalDegree,
              date: new Date(p.updatedAt || p.createdAt).toLocaleDateString('en-GB'),
              jobTitle: p.company?.title || p.jobId?.title || "General Application",
              
              // 🟢 ROUNDED SCORES 
              quiz: Math.round(p.aptitudeScore || 0),
              coding: Math.round(p.codingPercentage || 0),
              project: Math.round(p.projectScore || 0), 
              
              skills: st.skills || [] 
            };
          })
        );

        setPlacements(placementsWithProfiles);
      } catch (error) {
        console.error("Error fetching placements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementsData();
  }, []);

  if (loading) {
    return <div className="content-box" style={{ textAlign: "center", padding: "40px", color: "#553f9a", fontWeight: "bold" }}>Loading Placements Data... ⏳</div>;
  }

  return (
    <div className="content-box" style={{ padding: "30px", background: "#f8f9fc", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "35px", flexWrap: "wrap", gap: "15px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", color: "#1e1e2d", fontWeight: "800" }}>Placed Students</h2>
          <span style={{
            background: "#553f9a", color: "#fff", fontSize: "16px", fontWeight: "700",
            padding: "5px 15px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(85,63,154,0.3)"
          }}>
            {placements.length}
          </span>
        </div>
      </div>

      {/* EMPTY STATE */}
      {placements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#8a8b9f", fontSize: "16px", background: "#fff", borderRadius: "20px", border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>🎓</div>
          No students have been hired yet.
        </div>
      ) : (
        /* 🟢 PREMIUM CARDS GRID */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: "25px"
        }}>
          {placements.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                border: "1px solid #edf2f7",
                borderRadius: "20px",
                padding: "25px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                transition: "all 0.3s ease",
                position: "relative"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(85,63,154,0.1)";
                e.currentTarget.style.borderColor = "#d8d0f5";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.03)";
                e.currentTarget.style.borderColor = "#edf2f7";
              }}
            >
              {/* TOP HEADER (Avatar, Name, Badge) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  {/* 🟢 FIXED CIRCULAR IMAGE */}
                  <div style={{
                    width: "65px", height: "65px", borderRadius: "50%", border: "3px solid #f3f0ff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)", overflow: "hidden", display: "flex",
                    alignItems: "center", justifyContent: "center", background: "#f8f9fa", flexShrink: 0
                  }}>
                    <img
                      src={s.img}
                      alt={s.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      // Ek aur layer security ki. Agar avatar service down ho toh fallback default le le.
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=e2e8f0&color=475569`; }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "19px", fontWeight: "800", color: "#111827", marginBottom: "3px", textTransform: "capitalize" }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>📅</span> Applied: {s.date}
                    </div>
                  </div>
                </div>
                
                {/* 🟢 MODERN HIRED BADGE */}
                <div style={{
                  background: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "800",
                  padding: "5px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  HIRED
                </div>
              </div>

              {/* 🟢 EDUCATION INFO */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", color: "#475569", fontWeight: "600", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🎓</span> {s.degree}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", paddingLeft: "22px" }}>
                  {s.college}
                </div>
              </div>

              {/* 🟢 JOB ROLE BANNER */}
              <div style={{
                background: "#f8faff", borderLeft: "4px solid #553f9a", borderRadius: "8px",
                padding: "12px 15px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px"
              }}>
                <span style={{ fontSize: "18px" }}>💼</span>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Selected For</div>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#553f9a", textTransform: "capitalize" }}>{s.jobTitle}</div>
                </div>
              </div>

              {/* 🟢 SCORE CARDS ROW */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "15px"
              }}>
                {/* Score Function */}
                {[
                  { label: "Project", val: s.project, icon: "📂", color: "#f59e0b", bg: "#fef3c7" },
                  { label: "Quiz", val: s.quiz, icon: "📝", color: "#3b82f6", bg: "#dbeafe" },
                  { label: "Coding", val: s.coding, icon: "💻", color: "#8b5cf6", bg: "#e0e7ff" }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px",
                    padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px" }}>{item.icon}</span>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#1e293b", marginBottom: "6px" }}>
                      {item.val}%
                    </div>
                    {/* Tiny Progress Bar */}
                    <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${item.val}%`, height: "100%", background: item.color, borderRadius: "4px" }}></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacementsTab;