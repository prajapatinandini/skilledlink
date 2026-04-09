import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PortfolioModal = ({ student, onClose }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ API_URL backend se connect hone ke liye
  const API_URL = "https://skilledlink-f4lp.onrender.com";

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!student) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const studentId = student.id || student._id;
        
        const res = await axios.get(`${API_URL}/api/dashboard/portfolio/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPortfolioData(res.data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setPortfolioData({
          degree: "N/A", college: "N/A", year: "N/A", about: "Bio not available.",
          phone: "N/A", email: "N/A", github: "N/A", linkedin: "N/A",
          quizScore: 0, codingScore: 0,
          skills: [], projects: [], experience: [], achievements: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [student]);

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: "#ffffff", padding: "20px 40px", borderRadius: "10px", color: "#553f9a", fontWeight: "bold", fontSize: "16px" }}>
          Loading Portfolio... ⏳
        </div>
      </div>
    );
  }

  const p = portfolioData;
  if (!p) return null;

  const rankColors = student.id === 1
    ? ["#553f9a", "#7b5fc4"]
    : student.id === 2
      ? ["#6a55b8", "#8573cc"]
      : student.id === 3
        ? ["#8573cc", "#a394d8"]
        : ["#553f9a", "#7b5fc4"];

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff", borderRadius: "20px", width: "780px", maxWidth: "95vw",
          maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          fontFamily: "'Trebuchet MS',Arial,sans-serif"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HERO BANNER */}
        <div style={{
          background: `linear-gradient(135deg,${rankColors[0]},${rankColors[1]})`,
          borderRadius: "20px 20px 0 0", padding: "32px 36px 28px",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: "-40px", right: "100px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)",
              border: "none", borderRadius: "50%", width: "36px", height: "36px", fontSize: "18px",
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >✕</button>

          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            
            {/* 🚀 1. YAHAN HAI PHOTO KA BULLETPROOF LOGIC 🚀 */}
            <img
              src={
                (p?.profilePhoto || student?.img) 
                  ? (String(p.profilePhoto || student.img).startsWith('http') 
                      ? (p.profilePhoto || student.img) 
                      : `${API_URL}${p.profilePhoto || student.img}`) 
                  : "/default.png"
              }
              alt={student?.name || "Candidate"}
              style={{
                width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.5)", flexShrink: 0, boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
              }}
              onError={(e) => { 
                e.target.onerror = null; 
                const fallbackName = student?.name ? encodeURIComponent(student.name) : "Student";
                e.target.src = `https://ui-avatars.com/api/?name=${fallbackName}&background=random&color=fff`; 
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>{student.name}</span>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px", fontWeight: 700, padding: "3px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)" }}>
                  Candidate Profile
                </span>
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", marginBottom: "14px" }}>
                🎓 {p.degree} · {p.college} · Batch {p.year}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)", lineHeight: 1.6, margin: "0 0 16px", maxWidth: "480px" }}>
                {p.about}
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "5px 14px", borderRadius: "20px" }}>
                  ⭐ Overall: {student.percentage || Math.round(((p.quizScore || student.quiz || 0) + (p.codingScore || student.coding || 0)) / 2)}%
                </span>
                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "5px 14px", borderRadius: "20px" }}>
                  📝 Quiz: {p.quizScore || student.quiz || 0}%
                </span>
                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "5px 14px", borderRadius: "20px" }}>
                  💻 Coding: {p.codingScore || student.coding || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* contact row */}
          <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
            {[["📞", p.phone], ["✉️", p.email], ["🔗", p.github], ["💼", p.linkedin]].map(([ic, val]) => (
              val && val !== "N/A" && (
                <span key={val} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
                  <span>{ic}</span><span>{val}</span>
                </span>
              )
            ))}
          </div>

          {/* 🚀 2. YAHAN HAI RESUME DOWNLOAD BUTTON 🚀 */}
          {p.resumeUrl && p.resumeUrl !== "N/A" && (
            <div style={{ marginTop: "20px" }}>
              <a 
                href={`${API_URL}${p.resumeUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.25)",
                  color: "#fff", padding: "8px 16px", borderRadius: "10px", textDecoration: "none",
                  fontSize: "13px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.4)",
                  transition: "0.2s"
                }}
              >
                📄 Download Resume
              </a>
            </div>
          )}
        </div>

        {/* BODY */}
        <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Skills */}
          {p.skills && p.skills.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#2d1f6e", display: "flex", alignItems: "center", gap: "8px" }}>🛠️ Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {p.skills.map(sk => (
                  <span key={sk} style={{ background: "#f3f0ff", color: "#553f9a", fontSize: "13px", fontWeight: 600, padding: "6px 14px", borderRadius: "20px", border: "1.5px solid #e0d9f5" }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {p.projects && p.projects.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#2d1f6e", display: "flex", alignItems: "center", gap: "8px" }}>🚀 Projects</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {p.projects.map(pr => (
                  <div key={pr.name || pr.title} style={{ background: "linear-gradient(145deg,#faf8ff,#f3f0ff)", border: "1.5px solid #e0d9f5", borderRadius: "14px", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#2d1f6e" }}>{pr.name || pr.title}</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {pr.tech && pr.tech.map(t => (
                          <span key={t} style={{ background: "#ede8fb", color: "#553f9a", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: 1.55 }}>{pr.desc || pr.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {p.experience && p.experience.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#2d1f6e", display: "flex", alignItems: "center", gap: "8px" }}>💼 Experience</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {p.experience.map(ex => (
                  <div key={ex.role} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#faf8ff", border: "1.5px solid #e0d9f5", borderRadius: "12px", padding: "14px 18px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#ede8fb,#ddd5f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🏢</div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#2d1f6e" }}>{ex.role}</div>
                      <div style={{ fontSize: "13px", color: "#553f9a", fontWeight: 600 }}>{ex.company}</div>
                      <div style={{ fontSize: "12px", color: "#9d8ec4" }}>{ex.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {p.achievements && p.achievements.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#2d1f6e", display: "flex", alignItems: "center", gap: "8px" }}>🏆 Achievements</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {p.achievements.map(ac => (
                  <div key={ac} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#faf8ff", border: "1.5px solid #e0d9f5", borderRadius: "10px" }}>
                    <span style={{ color: "#553f9a", fontSize: "16px", flexShrink: 0 }}>✦</span>
                    <span style={{ fontSize: "13px", color: "#333", fontWeight: 500 }}>{ac}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;