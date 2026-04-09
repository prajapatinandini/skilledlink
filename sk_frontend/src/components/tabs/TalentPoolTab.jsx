import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TalentPoolTab = ({
  talentSearch,
  setTalentSearch,
  talentSkill,
  setTalentSkill,
  talentMin,
  setTalentMin,
  onStudentClick
}) => {
  // API data aur loading ke liye local states
  const [enriched, setEnriched] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://skilledlink-f4lp.onrender.com";
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 REAL API CALL (Fetch All Talent Pool)
  // ==========================================
  useEffect(() => {
    const fetchTalentPool = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/dashboard/talent-pool`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        // 🛠️ DATA MAPPING FIX: Ab hum 'branch' aur 'batchYear' ko map kar rahe hain
        const formattedData = (res.data || []).map(s => {
          const studentInfo = s.student || s;

          return {
            id: studentInfo._id || studentInfo.id || s._id,
            name: studentInfo.name || "Unknown Candidate",
            img: studentInfo.profilePhoto || studentInfo.img || null, // Naya Image variable liya
            port: {
              college: studentInfo.college || "N/A",
              degree: studentInfo.branch || studentInfo.degree || "N/A", // Backend se branch aata hai
              year: studentInfo.batchYear || studentInfo.year || "N/A", // Backend se batchYear aata hai
              skills: studentInfo.skills || s.skills || []
            },
            avgScore: s.avgScore || 0, 
            quiz: s.quiz || 0,
            coding: s.coding || 0,
            project: s.project || 0,
            percentage: s.percentage || s.avgScore || 0, 
            apps: s.apps || s.totalApplications || 1,
            hired: s.hired || s.hiredCount || 0,
            raw: s 
          };
        });

        setEnriched(formattedData);

        // Data aane ke baad usme se unique skills extract karna
        const skillsSet = new Set(formattedData.flatMap(s => s.port?.skills || []));
        setAllSkills([...skillsSet].sort());
        
      } catch (error) {
        console.error("Error fetching talent pool:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTalentPool();
  }, []);

  // Filtering logic 
  const filtered = enriched.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(talentSearch.toLowerCase()) ||
      (s.port && (
        (s.port.college && s.port.college.toLowerCase().includes(talentSearch.toLowerCase())) ||
        (s.port.degree && s.port.degree.toLowerCase().includes(talentSearch.toLowerCase()))
      ));
    const matchSkill = !talentSkill || (s.port && s.port.skills.includes(talentSkill));
    
    const calculatedOverall = Math.round(((s.project || 0) + (s.quiz || 0) + (s.coding || 0)) / 3);
    const matchScore = calculatedOverall >= talentMin;
    
    return matchSearch && matchSkill && matchScore;
  });

  if (loading) {
    return <div className="content-box" style={{ textAlign: "center", padding: "40px", color: "#553f9a", fontWeight: "bold" }}>Loading Talent Pool... ⏳</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "#2d1f6e" }}>
            Talent Pool
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9d8ec4" }}>
            Browse, filter and shortlist top candidates proactively
          </p>
        </div>
        <div style={{
          background: "linear-gradient(135deg,#553f9a,#7b5fc4)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          padding: "8px 18px",
          borderRadius: "20px",
          boxShadow: "0 4px 14px rgba(85,63,154,0.3)"
        }}>
          👥 {filtered.length} / {enriched.length} Students
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "linear-gradient(145deg,#ffffff,#faf8ff)",
        border: "1.5px solid #e0d9f5",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "flex-end",
        boxShadow: "0 4px 14px rgba(85,63,154,0.07)"
      }}>
        {/* Search */}
        <div style={{ flex: "2", minWidth: "200px" }}>
          <label style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#553f9a",
            display: "block",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.4px"
          }}>
            🔍 Search
          </label>
          <input
            value={talentSearch}
            onChange={e => setTalentSearch(e.target.value)}
            placeholder="Name, college, degree..."
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid #e0d9f5",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              fontFamily: "inherit",
              color: "#2d1f6e",
              background: "#fff",
              boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = "#553f9a"}
            onBlur={e => e.target.style.borderColor = "#e0d9f5"}
          />
        </div>

        {/* Skill filter */}
        <div style={{ flex: "2", minWidth: "180px" }}>
          <label style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#553f9a",
            display: "block",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.4px"
          }}>
            🛠️ Skill
          </label>
          <select
            value={talentSkill}
            onChange={e => setTalentSkill(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1.5px solid #e0d9f5",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              fontFamily: "inherit",
              color: "#2d1f6e",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            <option value="">All Skills</option>
            {allSkills.map(sk => <option key={sk} value={sk}>{sk}</option>)}
          </select>
        </div>

        {/* Min score */}
        <div style={{ flex: "2", minWidth: "180px" }}>
          <label style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#553f9a",
            display: "block",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.4px"
          }}>
            ⭐ Min Score: {talentMin}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={talentMin}
            onChange={e => setTalentMin(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#553f9a", cursor: "pointer" }}
          />
        </div>

        {/* Clear */}
        <button
          onClick={() => {
            setTalentSearch("");
            setTalentSkill("");
            setTalentMin(0);
          }}
          style={{
            padding: "10px 20px",
            background: "#f3f0ff",
            color: "#553f9a",
            border: "1.5px solid #e0d9f5",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#ede8fb"}
          onMouseLeave={e => e.currentTarget.style.background = "#f3f0ff"}
        >
          Clear
        </button>
      </div>

      {/* Student Cards Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9d8ec4", fontSize: "16px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          No students match your filters
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))",
          gap: "18px"
        }}>
          {filtered.map(s => {
            const statusColor = s.hired > 0 ? "#16a34a" : s.apps > 0 ? "#b45309" : "#6b7280";
            const statusBg = s.hired > 0 ? "#dcfce7" : s.apps > 0 ? "#fef9c3" : "#f1f5f9";
            const statusLabel = s.hired > 0 ? `✓ Hired (${s.hired}×)` : s.apps > 0 ? "In Pipeline" : "Not Applied";

            const calculatedOverall = Math.round(((s.project || 0) + (s.quiz || 0) + (s.coding || 0)) / 3);

            return (
              <div
                key={s.id}
                style={{
                  background: "linear-gradient(145deg,#ffffff,#faf8ff)",
                  border: "1.5px solid #e0d9f5",
                  borderRadius: "18px",
                  padding: "20px",
                  boxShadow: "0 5px 16px rgba(85,63,154,0.07)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s,box-shadow 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 14px 32px rgba(85,63,154,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 5px 16px rgba(85,63,154,0.07)";
                }}
                onClick={() => onStudentClick(s)}
              >
                {/* decorative blob */}
                <div style={{
                  position: "absolute",
                  top: "-22px",
                  right: "-22px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(85,63,154,0.05)"
                }} />

                {/* status pill */}
                <span style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: statusBg,
                  color: statusColor,
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px"
                }}>
                  {statusLabel}
                </span>

                {/* avatar + name */}
                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {/* 🚀 SMART IMAGE FIX APPLIED HERE */}
                    <img
                      src={
                        s.img 
                          ? (String(s.img).startsWith('http') ? s.img : `${API_URL}${s.img}`)
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=f3f0ff&color=553f9a&bold=true`
                      }
                      alt={s.name}
                      style={{
                        width: "58px",
                        height: "58px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid #e0d9f5",
                        boxShadow: "0 4px 10px rgba(85,63,154,0.12)"
                      }}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=f3f0ff&color=553f9a&bold=true`; 
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#2d1f6e" }}>{s.name}</div>
                    {s.port && (
                      <div style={{ fontSize: "12px", color: "#9d8ec4", marginTop: "2px" }}>
                        {s.port.degree} · {s.port.college}
                      </div>
                    )}
                    {s.port && (
                      <div style={{ fontSize: "12px", color: "#bbb", marginTop: "1px" }}>
                        Batch {s.port.year}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 SCORE BARS */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "14px"
                }}>
                  {[
                    ["🏆 Overall", calculatedOverall], 
                    ["📂 Project", s.project || 0],
                    ["📝 Quiz", s.quiz || 0],
                    ["💻 Coding", s.coding || 0]
                  ].map(([lbl, val]) => (
                    <div
                      key={lbl}
                      style={{
                        background: "#f3f0ff",
                        borderRadius: "10px",
                        padding: "8px 10px"
                      }}
                    >
                      <div style={{
                        fontSize: "10px",
                        color: "#9d8ec4",
                        fontWeight: 600,
                        marginBottom: "4px"
                      }}>
                        {lbl}
                      </div>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: 900,
                        color: "#553f9a",
                        lineHeight: 1
                      }}>
                        {val}%
                      </div>
                      <div style={{
                        height: "3px",
                        borderRadius: "3px",
                        background: "#e0d9f5",
                        marginTop: "5px"
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${val}%`,
                          borderRadius: "3px",
                          background: "linear-gradient(90deg,#553f9a,#8573cc)"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* skills */}
                {s.port && s.port.skills && s.port.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
                    {s.port.skills.slice(0, 4).map(sk => (
                      <span
                        key={sk}
                        style={{
                          background: talentSkill === sk ? "#553f9a" : "#f3f0ff",
                          color: talentSkill === sk ? "#fff" : "#553f9a",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: "20px",
                          border: "1px solid #e0d9f5"
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                    {s.port.skills.length > 4 && (
                      <span style={{
                        background: "#f3f0ff",
                        color: "#9d8ec4",
                        fontSize: "11px",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        border: "1px solid #e0d9f5"
                      }}>
                        +{s.port.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* footer */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "1px solid #f0eeff"
                }}>
                  <span style={{ fontSize: "12px", color: "#9d8ec4" }}>
                    {s.apps} application{s.apps !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#553f9a" }}>
                    View Portfolio →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TalentPoolTab;