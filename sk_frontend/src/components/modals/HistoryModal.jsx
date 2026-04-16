import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import ScoreBar from '../common/ScoreBar';
import { STATUS_CLS } from '../../data/constants';

const API_URL = "https://skilledlink-f4lp.onrender.com";

const HistoryModal = ({
  historyJob,
  historyFilter,
  setHistoryFilter,
  onSelectApplicant,
  onClose
}) => {
  const [histData, setHistData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🟢 FETCH DATA API
  // ==========================================
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); 
        const jobId = historyJob._id || historyJob.id;
        
        const res = await axios.get(`${API_URL}/api/dashboard/attempts/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const formattedData = (res.data.attempts || []).map(attempt => {
          let currentStatus = attempt.status;
          if (currentStatus === "completed" || currentStatus === "Pending") {
            currentStatus = "In Review";
          }

          const safeCodingScore = attempt.codingPercentage || 
            (attempt.codingTotalMarks > 0 ? (attempt.codingObtainedMarks / attempt.codingTotalMarks) * 100 : 0);

          const finalName = attempt.student?.name || "Unknown Applicant";

          // 🚀 1. SMART PHOTO FIX
          const rawImg = attempt.student?.profilePhoto || attempt.student?.img;
          const finalImg = rawImg 
            ? (String(rawImg).startsWith('http') ? rawImg : `${API_URL}${rawImg}`) 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=f3f0ff&color=553f9a&bold=true`;

          // 🚀 2. QUICK RESUME FIX
          const rawResume = attempt.student?.resumeUrl;
          const finalResume = rawResume && rawResume !== "N/A"
            ? (String(rawResume).startsWith('http') ? rawResume : `${API_URL}${rawResume}`)
            : null;

          // 🚀 3. EXTRACT LANGUAGES USED
          // Har attempt ke codingAnswers array se unique languages nikal rahe hain
          const usedLanguages = attempt.codingAnswers 
            ? [...new Set(attempt.codingAnswers.map(ans => ans.language?.toUpperCase()))].filter(Boolean)
            : [];

          return {
            id: attempt._id,
            name: finalName,
            email: attempt.student?.email || "No Email",
            img: finalImg,
            resumeUrl: finalResume,
            status: currentStatus,
            date: new Date(attempt.createdAt).toLocaleDateString('en-GB'),
            quiz: Math.round(attempt.aptitudeScore || 0),
            coding: Math.round(safeCodingScore),
            project: Math.round(attempt.projectScore || 0),
            final: Math.round(attempt.finalScore || 0),
            languages: usedLanguages, // 👈 Frontend mein dikhane ke liye languages array
            rawAttemptData: attempt
          };
        });

        setHistData(formattedData);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setHistData([]); 
      } finally {
        setLoading(false); 
      }
    };

    if (historyJob) {
      fetchApplicants();
    }
  }, [historyJob]);

  // ==========================================
  // 🚀 STATUS UPDATE & EMAIL TRIGGER
  // ==========================================
  const handleStatusChange = async (attemptId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.patch(
        `${API_URL}/api/application/${attemptId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHistData(prevData => 
        prevData.map(item => 
          item.id === attemptId ? { ...item, status: newStatus } : item
        )
      );

      alert(res.data.message || `Status updated to ${newStatus} and email sent! 📧`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const filtered = historyFilter === "All"
    ? histData
    : histData.filter(a => a.status === historyFilter);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box history-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Applicant History</h2>
            <p className="history-subtitle">
              <strong>{historyJob?.title || "Job Position"}</strong> · {loading ? "..." : histData.length} applicants
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="history-summary">
          {["All", "Hired", "In Review", "Rejected"].map(f => {
            const cnt = f === "All"
              ? histData.length
              : histData.filter(a => a.status === f).length;
            return (
              <button
                key={f}
                className={`history-filter-btn hf-${f.replace(" ", "-").toLowerCase()} ${historyFilter === f ? "hf-active" : ""}`}
                onClick={() => setHistoryFilter(f)}
              >
                {f} <span className="hf-count">{loading ? "0" : cnt}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="history-empty" style={{ padding: "40px 0", color: "#666" }}>
            Loading applicants data... ⏳
          </div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">No applicants found for this job yet.</div>
        ) : (
          <div className="history-list">
            {filtered.map((a, i) => (
              <div
                key={i}
                className="history-row history-row-clickable"
                onClick={() => onSelectApplicant(a)} 
              >
                <img 
                  src={a.img} 
                  alt={a.name} 
                  className="history-avatar"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=f3f0ff&color=553f9a&bold=true`; }}
                />
                
                <div className="history-info" style={{ flex: 1 }}>
                  
                  <div className="history-name-row" style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                    <span className="history-name">{a.name}</span>
                    
                    <select
                      className={`history-status ${STATUS_CLS[a.status] || "status-pending"}`}
                      value={a.status}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(a.id, e.target.value);
                      }}
                      style={{
                        padding: "4px 8px", borderRadius: "12px", border: "1px solid #ccc",
                        cursor: "pointer", outline: "none", fontWeight: "bold"
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    {a.resumeUrl && (
                      <a 
                        href={a.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        style={{
                          background: "#f3f0ff", color: "#553f9a", border: "1px solid #d8d0f5",
                          padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold",
                          textDecoration: "none", display: "flex", alignItems: "center", gap: "5px"
                        }}
                      >
                        📄 Resume
                      </a>
                    )}
                  </div>

                  <span className="history-date">Applied: {a.date}</span>
                  
                  {/* SCORES SECTION */}
                  <div 
                    className="history-scores" 
                    style={{ 
                      display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px", alignItems: "center" 
                    }}
                  >
                    <ScoreBar label="Quiz" value={a.quiz} />
                    <ScoreBar label="Coding" value={a.coding} />
                    <ScoreBar label="Project" value={a.project} />

                    {/* 🚀 LANGUAGES BADGES DISPLAY */}
                    {a.languages && a.languages.length > 0 && (
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        {a.languages.map((lang, idx) => (
                          <span key={idx} style={{
                            background: "#e0f2f1", color: "#00796b", border: "1px solid #b2dfdb",
                            padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "bold",
                            textTransform: "uppercase"
                          }}>
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div style={{
                      marginLeft: "auto", background: "linear-gradient(135deg, #553f9a, #7b5fc4)",
                      color: "#fff", padding: "6px 14px", borderRadius: "16px",
                      fontSize: "13px", fontWeight: "bold", boxShadow: "0 2px 6px rgba(85, 63, 154, 0.3)"
                    }}>
                      🏆 Final Score: {a.final}%
                    </div>
                  </div>
                  
                </div>
                <span className="history-row-arrow">›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;