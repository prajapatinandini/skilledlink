import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentDetailModal = ({ applicant, onBack, onClose }) => {
  const [view, setView] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false); 

  // 🟢 STATES
  const [projects, setProjects] = useState([]);
  const [evaluation, setEvaluation] = useState(null); 
  const [profileData, setProfileData] = useState(null); 
  const [loadingProjects, setLoadingProjects] = useState(false);

  
  const getToken = () => localStorage.getItem("token");

  // 1. DATA MAPPING
  const raw = applicant.rawAttemptData || {};
  const studentDbData = raw.student || {};

  // 🟢 2. INFO MAPPING: Ab ye sahi Profile Data se update hoga
  const info = {
    phone: profileData?.phone && profileData.phone !== "N/A" ? profileData.phone : (studentDbData.phone || "N/A"),
    email: profileData?.email && profileData.email !== "N/A" ? profileData.email : (studentDbData.email || applicant.email || "N/A"),
    college: profileData?.college && profileData.college !== "N/A" ? profileData.college : (studentDbData.college || "N/A"),
    degree: profileData?.degree && profileData.degree !== "N/A" ? profileData.degree : (studentDbData.degree || "N/A"),
    year: profileData?.year && profileData.year !== "N/A" ? profileData.year : (studentDbData.year || "N/A")
  };

  // 3. QUIZ MAPPING
  const quiz = (raw.aptitudeAnswers || []).map(q => ({
    q: q.questionText || "Question text missing",
    options: q.options || ["A", "B", "C", "D"],
    correct: q.correctAnswerIndex || 0,
    chosen: q.chosenAnswerIndex || 0,
    isCorrect: q.correctAnswerIndex === q.chosenAnswerIndex
  }));

  // 4. CODING MAPPING
  const coding = (raw.codingAnswers || []).map((c, i) => ({
    passed: c.testCasesPassed === c.totalTestCases && c.totalTestCases > 0,
    title: c.questionId?.title || `Problem ${i + 1}`,
    problem: c.questionId?.description || "Description not available",
    difficulty: c.questionId?.difficulty || "Medium",
    studentCode: c.code || "// No code submitted",
    timeTaken: "N/A" 
  }));

  const quizCorrect = quiz.filter(q => q.isCorrect).length;
  const codingPassed = coding.filter(c => c.passed).length;

  // ==========================================
  // 🟢 5. FETCH PROJECTS, EVALUATION & PROFILE
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProjects(true);
        const token = getToken();

        // 1. Fetch Projects & Evaluation (Yahan 'Attempt ID' lagta hai jo ki applicant.id hai)
        const projRes = await axios.get(`${API_URL}/dashboard/projects/${applicant.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(projRes.data.projects || []);
        setEvaluation(projRes.data.evaluation || { score: 0 });

        // 🟢 2. Fetch Full Profile (YAHAN FIX KIYA HAI: Ab 'Student ID' nikal kar bhejenge)
        const studentId = applicant.rawAttemptData?.student?._id || applicant.rawAttemptData?.student;

        if (studentId) {
          const portRes = await axios.get(`${API_URL}/dashboard/portfolio/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfileData(portRes.data);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    if (applicant.id) {
      fetchData();
    }
  }, [applicant.id, applicant.rawAttemptData]);

  // ==========================================
  // 🚀 ACTION HANDLER (Ab seedha EMAIL wale route pe jayega)
  // ==========================================
  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoadingAction(true);
      // 🔥 Yahan '/dashboard/attempt' ki jagah '/application' aayega 🔥
      await axios.patch(`${API_URL}/application/${applicant.id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      alert(`Student successfully marked as ${newStatus} and email sent! 📧🎉`);
      onClose(); 
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update student status. Please check your connection.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          color: "#111827",
          fontFamily: "'Trebuchet MS',Arial,sans-serif",
          borderRadius: "16px",
          width: "860px",
          maxWidth: "95vw",
          maxHeight: "92vh",
          display: "flex", 
          flexDirection: "column", 
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          boxSizing: "border-box",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`.sdm-inner *{box-sizing:border-box}`}</style>
        
        {/* Main Content Area with Scroll */}
        <div className="sdm-inner" style={{ padding: "28px 32px", overflowY: "auto", flex: 1 }}>
          {/* TOP ROW */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px"
          }}>
            <button
              style={{
                padding: "9px 20px",
                background: "#f3f0ff",
                color: "#553f9a",
                border: "1.5px solid #d8d0f5",
                borderRadius: "9px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit"
              }}
              onClick={view ? () => setView(null) : onBack}
            >
              ← {view ? "Back to Profile" : "Back"}
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#888",
                cursor: "pointer",
                lineHeight: 1
              }}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* PROFILE BANNER */}
          <div style={{
            display: "flex",
            gap: "22px",
            background: "linear-gradient(135deg,#553f9a,#7b5fc4)",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "28px"
          }}>
            <img
              src={applicant.img || "/default.png"}
              alt={applicant.name}
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.45)",
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
                flexWrap: "wrap"
              }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
                  {applicant.name}
                </span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: "20px",
                  background: applicant.status === "Hired"
                    ? "rgba(34,197,94,0.25)"
                    : applicant.status === "In Review"
                      ? "rgba(251,191,36,0.25)"
                      : applicant.status === "Rejected"
                        ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)"
                }}>
                  {applicant.status || "Pending"}
                </span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "7px 24px",
                marginBottom: "14px"
              }}>
                {[
                  ["📞", info.phone],
                  ["✉️", info.email],
                  ["🎓", info.college],
                  ["📋", `${info.degree} ${info.year !== "N/A" ? `· Batch ${info.year}` : ''}`],
                  ["📅", `Applied: ${applicant.date}`]
                ].map(([ic, val], i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "14px" }}>{ic}</span>
                    <span style={{ color: "rgba(255,255,255,0.92)", fontSize: "13px" }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  background: "rgba(168,85,247,0.2)",
                  color: "#e9d5ff",
                  border: "1px solid rgba(168,85,247,0.35)"
                }}>
                  📂 Project: {applicant.project || 0}%
                </span>
                <span style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  background: "rgba(34,197,94,0.2)",
                  color: "#bbf7d0",
                  border: "1px solid rgba(34,197,94,0.35)"
                }}>
                  📝 Quiz: {applicant.quiz || 0}%
                </span>
                <span style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  background: "rgba(96,165,250,0.2)",
                  color: "#bfdbfe",
                  border: "1px solid rgba(96,165,250,0.35)"
                }}>
                  💻 Coding: {applicant.coding || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* LANDING VIEW */}
          {!view && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              
              <button
                onClick={() => setView("projects")}
                style={{
                  display: "flex", flexDirection: "column", gap: "12px", padding: "20px",
                  background: "#fdf4ff", border: "2px solid #e8bceb", borderRadius: "16px",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  fontFamily: "inherit", width: "100%"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(168,85,247,0.18)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ width: "45px", height: "45px", borderRadius: "12px", background: "linear-gradient(135deg,#a855f7,#d946ef)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📂</div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Submitted Projects</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.4" }}>Review GitHub repos & AI Evaluation Feedback.</div>
                </div>
              </button>

              <button
                onClick={() => setView("quiz")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "20px",
                  background: "#faf8ff",
                  border: "2px solid #d8d0f5",
                  borderRadius: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  width: "100%"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#f0ebff";
                  e.currentTarget.style.borderColor = "#553f9a";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(85,63,154,0.18)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#faf8ff";
                  e.currentTarget.style.borderColor = "#d8d0f5";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg,#553f9a,#7b5fc4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px"
                }}>
                  📝
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>
                    View Quiz Paper
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.4" }}>
                    See questions attempted by the student with correct & wrong answers marked.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#dcfce7",
                    color: "#15803d"
                  }}>
                    ✓ {quizCorrect} Correct
                  </span>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#fee2e2",
                    color: "#b91c1c"
                  }}>
                    ✗ {quiz.length - quizCorrect} Wrong
                  </span>
                </div>
              </button>

              <button
                onClick={() => setView("coding")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "20px",
                  background: "#f0f9ff",
                  border: "2px solid #bae6fd",
                  borderRadius: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  width: "100%"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.borderColor = "#0284c7";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(2,132,199,0.18)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#f0f9ff";
                  e.currentTarget.style.borderColor = "#bae6fd";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg,#0284c7,#38bdf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px"
                }}>
                  💻
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>
                    View Coding Round
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.4" }}>
                    Review all coding problems with the student's submitted code and test case results.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#dcfce7",
                    color: "#15803d"
                  }}>
                    ✓ {codingPassed} Passed
                  </span>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#fee2e2",
                    color: "#b91c1c"
                  }}>
                    ✗ {coding.length - codingPassed} Failed
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* ----------------- 🟢 PROJECTS & EVALUATION VIEW ----------------- */}
          {view === "projects" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>📂 Project Submissions</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>Review student's GitHub work and AI analysis.</p>
                </div>
                <div style={{ background: "#f3e8ff", color: "#a855f7", padding: "6px 15px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
                  Overall AI Score: {applicant.project || 0}%
                </div>
              </div>

              {loadingProjects ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Fetching repositories and AI evaluation... ⏳</div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "10px", color: "#666" }}>
                  No projects were submitted by this candidate.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {projects.map((proj, i) => (
                    <div key={i} style={{ padding: "20px", border: "1.5px solid #e8bceb", borderRadius: "12px", background: "#fdf4ff", display: "flex", flexDirection: "column", gap: "14px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0", color: "#86198f", fontSize: "16px" }}>{proj.title}</h4>
                          {proj.repoUrl && (
                            <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                              🔗 View GitHub Repository
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#16a34a", textDecoration: "underline", fontSize: "13px", fontWeight: "600", display: "block" }}>
                              🌐 View Live Website
                            </a>
                          )}
                        </div>
                        
                        {proj.score !== null && (
                          <div style={{ background: "#a855f7", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
                            Score: {proj.score}/100
                          </div>
                        )}
                      </div>

                      {proj.suspicious && (
                        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", border: "1px solid #fca5a5" }}>
                          ⚠️ AI Flag: Suspicious commit activity detected (Possible copied project).
                        </div>
                      )}

                      {proj.details ? (
                        <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #f5d0fe" }}>
                          <h5 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#4b5563" }}>🤖 AI Evaluation Breakdown:</h5>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                            <div style={{ fontSize: "12px" }}><strong style={{ color: "#a855f7" }}>Commits:</strong> {proj.details.commit}/20</div>
                            <div style={{ fontSize: "12px" }}><strong style={{ color: "#a855f7" }}>Code Quality:</strong> {proj.details.quality}/25</div>
                            <div style={{ fontSize: "12px" }}><strong style={{ color: "#a855f7" }}>Structure:</strong> {proj.details.structure}/20</div>
                            <div style={{ fontSize: "12px" }}><strong style={{ color: "#a855f7" }}>Language:</strong> {proj.details.language}/12</div>
                            <div style={{ fontSize: "12px" }}><strong style={{ color: "#a855f7" }}>Activity:</strong> {proj.details.activity}/10</div>
                            <div style={{ fontSize: "12px" }}><strong style={{ color: "#a855f7" }}>Authenticity:</strong> {proj.details.authenticity}/13</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "13px", color: "#9ca3af", fontStyle: "italic" }}>
                          AI Evaluation is pending or failed for this repository.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QUIZ VIEW */}
          {view === "quiz" && (
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                    📝 Quiz Paper
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                    {quizCorrect}/{quiz.length} correct answers
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    background: "#dcfce7",
                    color: "#15803d"
                  }}>
                    ✓ {quizCorrect} Correct
                  </span>
                  <span style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    background: "#fee2e2",
                    color: "#b91c1c"
                  }}>
                    ✗ {quiz.length - quizCorrect} Wrong
                  </span>
                </div>
              </div>
              
              {quiz.length === 0 ? (
                 <div style={{ textAlign: "center", padding: "30px", color: "#666", background: "#f9fafb", borderRadius: "10px" }}>
                   No detailed quiz data was saved for this attempt.
                 </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {quiz.map((q, qi) => (
                    <div
                      key={qi}
                      style={{
                        borderRadius: "12px",
                        border: `2px solid ${q.isCorrect ? "#86efac" : "#fca5a5"}`,
                        background: "#ffffff"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "14px 18px",
                        background: q.isCorrect ? "#f0fdf4" : "#fff5f5",
                        borderRadius: "10px 10px 0 0",
                        flexWrap: "wrap"
                      }}>
                        <span style={{
                          color: "#553f9a",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#ede8fb",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                          marginTop: "2px"
                        }}>
                          Q{qi + 1}
                        </span>
                        <p style={{
                          color: "#111827",
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: 1.55,
                          flex: 1,
                          margin: 0
                        }}>
                          {q.q}
                        </p>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 12px",
                          borderRadius: "20px",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                          background: q.isCorrect ? "#16a34a" : "#dc2626",
                          color: "#ffffff"
                        }}>
                          {q.isCorrect ? "✓ Correct" : "✗ Wrong"}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "7px",
                        padding: "12px 18px 14px",
                        background: "#ffffff",
                        borderRadius: "0 0 10px 10px"
                      }}>
                        {q.options.map((opt, oi) => {
                          const isRight = oi === q.correct;
                          const isWrong = oi === q.chosen && !q.isCorrect;
                          return (
                            <div
                              key={oi}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "9px 13px",
                                borderRadius: "8px",
                                background: isRight ? "#dcfce7" : isWrong ? "#fee2e2" : "#f9fafb",
                                border: `1.5px solid ${isRight ? "#4ade80" : isWrong ? "#f87171" : "#e5e7eb"}`
                              }}
                            >
                              <span style={{
                                color: "#553f9a",
                                fontSize: "11px",
                                fontWeight: 800,
                                width: "18px",
                                flexShrink: 0
                              }}>
                                {["A", "B", "C", "D"][oi]}
                              </span>
                              <span style={{
                                color: "#111827",
                                fontSize: "13px",
                                flex: 1,
                                lineHeight: 1.4
                              }}>
                                {opt}
                              </span>
                              {isRight && (
                                <span style={{
                                  background: "#16a34a",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  flexShrink: 0,
                                  whiteSpace: "nowrap"
                                }}>
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isWrong && (
                                <span style={{
                                  background: "#dc2626",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  flexShrink: 0,
                                  whiteSpace: "nowrap"
                                }}>
                                  ✗ Student's Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CODING VIEW */}
          {view === "coding" && (
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                    💻 Coding Round
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                    {codingPassed}/{coding.length} problems passed
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <span style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    background: "#dcfce7",
                    color: "#15803d"
                  }}>
                    ✓ {codingPassed} Passed
                  </span>
                  <span style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 700,
                    background: "#fee2e2",
                    color: "#b91c1c"
                  }}>
                    ✗ {coding.length - codingPassed} Failed
                  </span>
                </div>
              </div>
              
              {coding.length === 0 ? (
                 <div style={{ textAlign: "center", padding: "30px", color: "#666", background: "#f9fafb", borderRadius: "10px" }}>
                   No coding data was saved for this attempt.
                 </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {coding.map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        borderRadius: "12px",
                        border: `2px solid ${c.passed ? "#86efac" : "#fca5a5"}`,
                        background: "#ffffff"
                      }}
                    >
                      <div style={{
                        padding: "16px 20px 14px",
                        background: c.passed ? "#f0fdf4" : "#fff5f5",
                        borderRadius: "10px 10px 0 0"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                          flexWrap: "wrap"
                        }}>
                          <span style={{
                            color: "#553f9a",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: "#ede8fb",
                            padding: "3px 11px",
                            borderRadius: "20px",
                            whiteSpace: "nowrap"
                          }}>
                            Problem {ci + 1}
                          </span>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "20px",
                            whiteSpace: "nowrap",
                            background: c.difficulty === "Easy"
                              ? "#dcfce7"
                              : c.difficulty === "Medium"
                                ? "#fef9c3"
                                : "#fee2e2",
                            color: c.difficulty === "Easy"
                              ? "#15803d"
                              : c.difficulty === "Medium"
                                ? "#a16207"
                                : "#b91c1c"
                          }}>
                            {c.difficulty}
                          </span>
                          <span style={{
                            marginLeft: "auto",
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "4px 14px",
                            borderRadius: "20px",
                            background: c.passed ? "#16a34a" : "#dc2626",
                            color: "#fff",
                            whiteSpace: "nowrap"
                          }}>
                            {c.passed ? "✓ Passed" : "✗ Failed"}
                          </span>
                        </div>
                        <p style={{
                          color: "#111827",
                          fontSize: "15px",
                          fontWeight: 700,
                          margin: 0,
                          lineHeight: 1.4
                        }}>
                          {c.title}
                        </p>
                        <p style={{
                          color: "#374151",
                          fontSize: "13px",
                          margin: "6px 0 0",
                          lineHeight: 1.6
                        }}>
                          {c.problem}
                        </p>
                      </div>
                      <div style={{
                        padding: "16px 20px",
                        background: "#ffffff",
                        borderTop: "1px solid #e5e7eb"
                      }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                          flexWrap: "wrap",
                          gap: "8px"
                        }}>
                          <span style={{ color: "#553f9a", fontSize: "13px", fontWeight: 700 }}>
                            Student's Submitted Code
                          </span>
                          <span style={{ color: "#6b7280", fontSize: "12px" }}>
                            ⏱ Time taken: {c.timeTaken}
                          </span>
                        </div>
                        <pre style={{
                          margin: 0,
                          background: "#1e1e2e",
                          color: "#cdd6f4",
                          padding: "16px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontFamily: "'Courier New',monospace",
                          lineHeight: "1.8",
                          overflowX: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word"
                        }}>
                          {c.studentCode}
                        </pre>
                      </div>
                      <div style={{
                        padding: "12px 20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        background: c.passed ? "#dcfce7" : "#fee2e2",
                        color: c.passed ? "#15803d" : "#b91c1c",
                        borderTop: "1px solid #e5e7eb",
                        borderRadius: "0 0 10px 10px"
                      }}>
                        {c.passed
                          ? "✅ All test cases passed — output matched expected result."
                          : "❌ Test cases failed — output did not match expected result."
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 🆕 HR ACTION BAR (Fixed at bottom) */}
        {/* ========================================== */}
        {!view && (
          <div style={{ 
            padding: "20px 32px", 
            background: "#f9fafb", 
            borderTop: "1px solid #e5e7eb", 
            borderRadius: "0 0 16px 16px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <span style={{ fontWeight: 600, color: "#4b5563", fontSize: "14px" }}>
              Take Action on Application:
            </span>
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => handleUpdateStatus("Rejected")} 
                disabled={loadingAction}
                style={{ 
                  padding: "10px 20px", background: "#fff", border: "1px solid #ef4444", color: "#ef4444", 
                  borderRadius: "8px", fontWeight: 600, cursor: "pointer", transition: "0.2s" 
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                ❌ Reject
              </button>
              <button 
                onClick={() => handleUpdateStatus("In Review")} 
                disabled={loadingAction}
                style={{ 
                  padding: "10px 20px", background: "#fff", border: "1px solid #f59e0b", color: "#f59e0b", 
                  borderRadius: "8px", fontWeight: 600, cursor: "pointer", transition: "0.2s" 
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                👀 Keep in Review
              </button>
              <button 
                onClick={() => handleUpdateStatus("Hired")} 
                disabled={loadingAction}
                style={{ 
                  padding: "10px 24px", background: "#16a34a", border: "none", color: "#fff", 
                  borderRadius: "8px", fontWeight: 700, cursor: "pointer", transition: "0.2s", 
                  boxShadow: "0 4px 10px rgba(22, 163, 74, 0.2)" 
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {loadingAction ? "Processing..." : "🎉 Hire Student"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailModal;