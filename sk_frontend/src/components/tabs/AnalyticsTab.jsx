import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsTab = () => {
  const [data, setData] = useState({ applications: [], jobs: [] });
  const [loading, setLoading] = useState(true);

  const P = "#553f9a";
  const PL = "#8573cc";

 const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 REAL API CALL (Fetch Analytics Data)
  // ==========================================
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // 🛠️ Updated to match dashboard routes. Assuming '/dashboard/analytics'
        const res = await axios.get(`${API_URL}/dashboard/analytics`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        const rawJobs = res.data.jobs || [];
        const rawApps = res.data.applications || [];

        // 🟢 1. MAP JOBS
        const formattedJobs = rawJobs.map(j => ({
          id: j._id || j.id,
          title: j.title
        }));

        // 🟢 2. MAP APPLICATIONS (Test Attempts)
        const formattedApps = rawApps.map(a => {
          // Status mapping for HR View
          let currentStatus = a.status;
          if (currentStatus === "completed" || currentStatus === "Pending") {
            currentStatus = "In Review";
          }
          
          // Naya logic naam aur photo ke liye
          const finalName = a.student?.name || "Unknown Applicant";

          return {
            id: a._id || a.id,
            jid: a.company || a.jobId, // Ensure this matches how Job ID is stored in TestAttempt
            name: finalName,
            // 🟢 UPDATE 1: Image me smart fallback avatar add kar diya (design bina chhede)
            img: a.student?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=f3f0ff&color=553f9a&bold=true`,
            status: currentStatus,
            quiz: a.aptitudeScore || 0,
            coding: a.codingPercentage || 0,
            // 🟢 UPDATE 2: Project score add kiya taki average 27 nikal sake
            project: a.projectScore || 0
          };
        });

        setData({ applications: formattedApps, jobs: formattedJobs });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="content-box" style={{ textAlign: "center", padding: "40px", color: P, fontWeight: "bold" }}>Loading Analytics Dashboard... ⏳</div>;
  }

  const allApps = data.applications || [];
  const allJobs = data.jobs || [];

  const hired = allApps.filter(a => a.status === "Hired");
  const review = allApps.filter(a => a.status === "In Review");
  const rejected = allApps.filter(a => a.status === "Rejected");

  const hireRate = allApps.length > 0 ? Math.round((hired.length / allApps.length) * 100) : 0;
  const avgQuiz = allApps.length > 0 ? Math.round(allApps.reduce((s, a) => s + a.quiz, 0) / allApps.length) : 0;
  const avgCode = allApps.length > 0 ? Math.round(allApps.reduce((s, a) => s + a.coding, 0) / allApps.length) : 0;

  // Per-job stats
  const jobStats = allJobs.map(job => {
    const apps = allApps.filter(a => String(a.jid) === String(job.id));
    const h = apps.filter(a => a.status === "Hired").length;
    const aq = apps.length ? Math.round(apps.reduce((s, a) => s + a.quiz, 0) / apps.length) : 0;
    const ac = apps.length ? Math.round(apps.reduce((s, a) => s + a.coding, 0) / apps.length) : 0;
    return {
      title: job.title,
      total: apps.length,
      hired: h,
      rate: apps.length ? Math.round(h / apps.length * 100) : 0,
      avgQuiz: aq,
      avgCode: ac
    };
  }).sort((a, b) => b.total - a.total);

  // Top scorers
  const scorerMap = {};
  allApps.forEach(a => {
    if (!scorerMap[a.name]) scorerMap[a.name] = { name: a.name, img: a.img, total: 0, count: 0 };
    // 🟢 UPDATE 3: Score divide by 3 kiya (Quiz + Coding + Project), taaki 17% ki jagah 27% aaye
    scorerMap[a.name].total += (a.quiz + a.coding + a.project) / 3;
    scorerMap[a.name].count += 1;
  });
  
  const topScorers = Object.values(scorerMap)
    .map(s => ({ ...s, avg: Math.round(s.total / s.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  // Score buckets
  const buckets = { "90–100": 0, "80–89": 0, "70–79": 0, "60–69": 0, "<60": 0 };
  allApps.forEach(a => {
    // 🟢 UPDATE 4: Buckets me bhi 3 se divide kiya taaki graph sahi bar bane
    const avg = (a.quiz + a.coding + a.project) / 3;
    if (avg >= 90) buckets["90–100"]++;
    else if (avg >= 80) buckets["80–89"]++;
    else if (avg >= 70) buckets["70–79"]++;
    else if (avg >= 60) buckets["60–69"]++;
    else buckets["<60"]++;
  });
  const maxBucket = Math.max(...Object.values(buckets), 1); 

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: "linear-gradient(145deg,#ffffff,#faf8ff)",
      border: "1.5px solid #e0d9f5",
      borderRadius: "18px",
      padding: "24px",
      boxShadow: "0 6px 20px rgba(85,63,154,0.08)",
      ...style
    }}>
      {children}
    </div>
  );

  const SectionTitle = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#2d1f6e" }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "#2d1f6e" }}>
            Hiring Analytics
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#9d8ec4" }}>
            Full overview of your recruitment pipeline performance
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
          📊 {allApps.length} Total Applications
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        {[
          { icon: "📥", label: "Total Applied", value: allApps.length, sub: "All applicants" },
          { icon: "✅", label: "Hire Rate", value: `${hireRate}%`, sub: `${hired.length} of ${allApps.length} hired` },
          { icon: "📝", label: "Avg Quiz Score", value: `${avgQuiz}%`, sub: "Across all applicants" },
          { icon: "💻", label: "Avg Coding Score", value: `${avgCode}%`, sub: "Across all applicants" },
        ].map(({ icon, label, value, sub }) => (
          <div key={label} style={{
            background: "linear-gradient(145deg,#faf8ff,#f3f0ff)",
            border: "1.5px solid #e0d9f5",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 4px 14px rgba(85,63,154,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-16px",
              right: "-16px",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(85,63,154,0.05)"
            }} />
            <span style={{ fontSize: "26px" }}>{icon}</span>
            <span style={{
              fontSize: "30px",
              fontWeight: 900,
              color: P,
              lineHeight: 1,
              letterSpacing: "-1px"
            }}>
              {value}
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#2d1f6e" }}>{label}</span>
            <span style={{ fontSize: "11px", color: "#9d8ec4" }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Funnel + Distribution */}
      {allApps.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <Card>
            <SectionTitle icon="🔽" title="Hiring Funnel" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Applied", count: allApps.length, color: "#553f9a", pct: 100 },
                { label: "In Review", count: review.length + hired.length, color: "#7b5fc4", pct: Math.round((review.length + hired.length) / allApps.length * 100) },
                { label: "Hired", count: hired.length, color: "#22c55e", pct: Math.round(hired.length / allApps.length * 100) },
                { label: "Rejected", count: rejected.length, color: "#f87171", pct: Math.round(rejected.length / allApps.length * 100) },
              ].map(({ label, count, color, pct }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>{label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color }}>
                      {count} <span style={{ color: "#bbb", fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: "10px", borderRadius: "10px", background: "#f0eeff" }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: "10px",
                      background: color,
                      transition: "width 0.5s"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon="📊" title="Score Distribution" />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(buckets).map(([range, count]) => (
                <div key={range} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#666",
                    width: "54px",
                    flexShrink: 0
                  }}>
                    {range}
                  </span>
                  <div style={{
                    flex: 1,
                    height: "22px",
                    borderRadius: "8px",
                    background: "#f0eeff",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.round(count / maxBucket * 100)}%`,
                      background: "linear-gradient(90deg,#553f9a,#8573cc)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "8px",
                      minWidth: count > 0 ? "32px" : "0",
                      transition: "width 0.5s"
                    }}>
                      {count > 0 && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{count}</span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "12px",
                    color: "#9d8ec4",
                    width: "28px",
                    textAlign: "right",
                    flexShrink: 0
                  }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
            {/* 🟢 UPDATE 5: Text change kiya taki users ko pta rahe project score bhi include hai */}
            <p style={{ margin: "14px 0 0", fontSize: "12px", color: "#bbb", textAlign: "center" }}>
              Based on average (project + quiz + coding) scores
            </p>
          </Card>
        </div>
      ) : (
        <Card style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No applicant data available yet to display charts.
        </Card>
      )}

      {/* Job Performance Table */}
      {jobStats.length > 0 && (
        <Card>
          <SectionTitle icon="💼" title="Job-wise Performance" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0d9f5" }}>
                  {["Job Title", "Applicants", "Hired", "Hire Rate", "Avg Quiz", "Avg Coding", "Performance"].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#553f9a",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobStats.map((j, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #f0eeff",
                      background: i % 2 === 0 ? "#faf8ff" : "#ffffff"
                    }}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#2d1f6e" }}>
                      {j.title}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#555" }}>{j.total}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        background: "#dcfce7",
                        color: "#16a34a",
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: "20px",
                        fontSize: "12px"
                      }}>
                        {j.hired}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        background: j.rate >= 70 ? "#ede8fb" : "#fff0f0",
                        color: j.rate >= 70 ? P : "#ef4444",
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: "20px",
                        fontSize: "12px"
                      }}>
                        {j.rate}%
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#555" }}>{j.avgQuiz}%</td>
                    <td style={{ padding: "12px 14px", color: "#555" }}>{j.avgCode}%</td>
                    <td style={{ padding: "12px 14px", minWidth: "100px" }}>
                      <div style={{ height: "6px", borderRadius: "6px", background: "#e0d9f5" }}>
                        <div style={{
                          height: "100%",
                          width: `${j.rate}%`,
                          borderRadius: "6px",
                          background: `linear-gradient(90deg,${P},${PL})`
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Top Performers */}
      {topScorers.length > 0 && (
        <Card>
          <SectionTitle icon="🏆" title="Top 5 Performers (Avg Score)" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topScorers.map((s, i) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 16px",
                  background: i === 0 ? "linear-gradient(135deg,#faf8ff,#ede8fb)" : "#faf8ff",
                  border: `1.5px solid ${i === 0 ? "#c8b8f0" : "#e0d9f5"}`,
                  borderRadius: "12px"
                }}
              >
                <span style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#9d8ec4",
                  width: "24px",
                  textAlign: "center"
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <img
                  src={s.img}
                  alt={s.name}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #e0d9f5",
                    flexShrink: 0
                  }}
                  // 🟢 EK AUR FALLBACK: Incase image link broken ho, UI crash na kare
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=f3f0ff&color=553f9a&bold=true`; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#2d1f6e" }}>{s.name}</div>
                  <div style={{ fontSize: "12px", color: "#9d8ec4" }}>
                    {s.count} application{s.count > 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: P, lineHeight: 1 }}>
                    {s.avg}%
                  </div>
                  <div style={{ fontSize: "11px", color: "#bbb" }}>avg score</div>
                </div>
                <div style={{ width: "80px" }}>
                  <div style={{ height: "6px", borderRadius: "6px", background: "#e0d9f5" }}>
                    <div style={{
                      height: "100%",
                      width: `${s.avg}%`,
                      borderRadius: "6px",
                      background: "linear-gradient(90deg,#553f9a,#8573cc)"
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsTab;