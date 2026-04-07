import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import ScoreBar from '../common/ScoreBar';
import { STATUS_CLS } from '../../data/constants';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HistoryModal = ({
  historyJob,
  historyFilter,
  setHistoryFilter,
  onSelectApplicant,
  onClose
}) => {
  // Local states for data
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
        
        const res = await axios.get(`${API_URL}/dashboard/attempts/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const formattedData = (res.data.attempts || []).map(attempt => {
          let currentStatus = attempt.status;
          if (currentStatus === "completed" || currentStatus === "Pending") {
            currentStatus = "In Review";
          }

          const safeCodingScore = attempt.codingPercentage || 
            (attempt.codingTotalMarks > 0 ? (attempt.codingObtainedMarks / attempt.codingTotalMarks) * 100 : 0);

          return {
            id: attempt._id,
            name: attempt.student?.name || "Unknown Applicant",
            email: attempt.student?.email || "No Email",
            img: attempt.student?.img || "/default.png",
            status: currentStatus,
            date: new Date(attempt.createdAt).toLocaleDateString('en-GB'),
            quiz: Math.round(attempt.aptitudeScore || 0),
            coding: Math.round(safeCodingScore),
            project: Math.round(attempt.projectScore || 0),
            final: Math.round(attempt.finalScore || 0),
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
  // 🚀 NAYA FUNCTION: STATUS UPDATE & EMAIL TRIGGER
  // ==========================================
  const handleStatusChange = async (attemptId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      // Backend api hit karega jahan email bhejte hain
      const res = await axios.patch(
        `${API_URL}/application/${attemptId}/status`, // 👈 Backend route
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // UI update taaki turant naya status dikhe (Bina refresh kiye)
      setHistData(prevData => 
        prevData.map(item => 
          item.id === attemptId ? { ...item, status: newStatus } : item
        )
      );

      alert(res.data.message || `Status updated to ${newStatus} and email sent! 📧`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Make sure backend route is correct.");
    }
  };

  // Filtering logic
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

        {/* Loading State UI */}
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
                <img src={a.img} alt={a.name} className="history-avatar" />
                <div className="history-info" style={{ flex: 1 }}>
                  
                  {/* 🟢 DROPDOWN YAHAN ADD KIYA HAI */}
                  <div className="history-name-row" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span className="history-name">{a.name}</span>
                    
                    <select
                      className={`history-status ${STATUS_CLS[a.status] || "status-pending"}`}
                      value={a.status}
                      // stopPropagation zaroori hai taaki select dabane par modal na khul jaye
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