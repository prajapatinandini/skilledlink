import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardTab = ({ onStudentClick }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  
const API_URL = "https://skilledlink-f4lp.onrender.com";
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 REAL API CALL (Dashboard Data)
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // 🛠️ Calling the dashboard route we created earlier
        const res = await axios.get(`${API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="content-box" style={{ textAlign: "center", padding: "40px", color: "#553f9a", fontWeight: "bold" }}>Loading Dashboard... ⏳</div>;
  }

  // 🛠️ MAPPING DATA: Backend ke naye variable names (totalApplicants, hiredCandidates, etc.) ke hisaab se map kiya
  const stats = {
    applied: data?.totalApplicants || 0,
    hired: data?.hiredCandidates || 0,
    companies: 1, // Ek hi company logged in hoti hai, ya system ki total dikhani hai toh API me add kar lena
    jobs: data?.totalJobs || data?.activeJobs || 0
  };
  
  // 🛠️ Agar backend top scorers nahi bhej raha abhi, toh empty array rakhenge crash se bachne ke liye
  const topStudents = data?.topStudents || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {[
          { icon: "👨‍🎓", value: stats.applied, title: "Students Applied", desc: "Total applicants" },
          { icon: "🏆", value: stats.hired, title: "Students Hired", desc: "Successfully placed" },
          { icon: "🏢", value: stats.companies, title: "Companies", desc: "Partner companies" }, // Ise aap hata sakte ho agar irrelevant ho
          { icon: "💼", value: stats.jobs, title: "Jobs Posted", desc: "Active positions" }
        ].map((card, index) => (
          <div key={index} style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(85, 63, 154, 0.05)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Decorative Background Blob */}
            <div style={{
              position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px",
              borderRadius: "50%", background: "rgba(85, 63, 154, 0.04)"
            }} />
            
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px", background: "#f3f0ff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px"
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "#2d1f6e", lineHeight: "1" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginTop: "8px" }}>
              {card.title}
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Top Students Section */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 10px 30px rgba(85, 63, 154, 0.05)"
      }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#553f9a", margin: "0 0 24px 0" }}>
          Top Students
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {topStudents.length === 0 ? (
            <div style={{ color: "#6b7280", fontStyle: "italic" }}>
              No students data available yet. Review some applicants to see top performers!
            </div>
          ) : (
            topStudents.map((student, index) => (
              <div 
                key={student.id || student._id} 
                onClick={() => onStudentClick && onStudentClick(student)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: index === 0 ? "linear-gradient(90deg, #4c3289, #6a55b8)" : index === 1 ? "linear-gradient(90deg, #6a55b8, #8573cc)" : "linear-gradient(90deg, #8573cc, #a394d8)",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateX(5px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
              >
                <div style={{ fontSize: "16px", fontWeight: "800", width: "30px" }}>
                  {student.rank || index + 1}
                </div>
                <img 
                  src={student.img || "/default.png"} 
                  alt={student.name} 
                  style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", marginRight: "16px", objectFit: "cover" }} 
                />
                <div style={{ flex: 1, fontSize: "16px", fontWeight: "600" }}>
                  {student.name}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "800" }}>
                  {student.percentage || student.averageScore || 0}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardTab;