import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentModal from "../components/modals/PaymentModal";

// ✅ API_URL configuration
const API_URL = "https://skilledlink-f4lp.onrender.com";

const renderSafe = (val) => {
  if (val === undefined || val === null) return "N/A";
  if (React.isValidElement(val)) return val;
  if (Array.isArray(val)) return val.map(v => renderSafe(v)).join(', ');
  if (typeof val === 'object') return val.label || val.name || val.value || JSON.stringify(val);
  return String(val);
};

// 🟢 PROFILE VIEW COMPONENT
const ProfileView = ({ profile, onEdit }) => {
  if (!profile) return <div style={{ padding: '20px', textAlign: 'center' }}>Profile details load ho rahi hain...</div>;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '1.5px solid #ede8fb', display: 'flex', alignItems: 'center', gap: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={profile.profilePhoto ? (String(profile.profilePhoto).startsWith('http') ? profile.profilePhoto : `${API_URL}${profile.profilePhoto}`) : "/default.png"} 
            alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f3f0ff' }}
            onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Student&background=random"; }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#2d1f6e', fontSize: '28px' }}>{renderSafe(profile.user?.name) || "Student"}</h2>
              <p style={{ margin: '5px 0', color: '#553f9a', fontWeight: '600', fontSize: '16px' }}>{renderSafe(profile.college)}</p>
              <p style={{ margin: 0, color: '#9d8ec4', fontSize: '14px' }}>{renderSafe(profile.branch)} • {renderSafe(profile.semester)} Semester</p>
            </div>
            <button onClick={onEdit} style={editBtnStyle}>✏️ Update Profile</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <span style={badgeStyle}>Batch: {renderSafe(profile.batchYear)}</span>
            <span style={{ ...badgeStyle, background: '#f0fdf4', color: '#16a34a' }}>Profile Status: Verified</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🚀 Technical Stack</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
              {profile.techStack && Array.isArray(profile.techStack) && profile.techStack.length > 0 ? (
                profile.techStack.map((t, i) => <span key={i} style={tagStyle}>{renderSafe(t)}</span>)
              ) : <p style={{color: '#999', fontSize: '14px'}}>No tech stack added yet.</p>}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🛠️ Core Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
              {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                profile.skills.map((s, i) => <span key={i} style={{ ...tagStyle, background: '#fef2f2', color: '#dc2626' }}>{renderSafe(s)}</span>)
              ) : <p style={{color: '#999', fontSize: '14px'}}>No skills added yet.</p>}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>💼 Work Experience</h3>
            <p style={{ color: '#444', lineHeight: '1.7', whiteSpace: 'pre-line', marginTop: '10px' }}>
              {profile.experience ? renderSafe(profile.experience) : "Apna work experience ya internships yahan add karein."}
            </p>

            <h3 style={{ ...cardTitleStyle, marginTop: '25px' }}>🏆 Key Achievements</h3>
            {profile.achievements && String(profile.achievements).trim() !== "" ? (
              <ul style={{ paddingLeft: '20px', color: '#444', lineHeight: '1.7', margin: '10px 0 0 0' }}>
                {(Array.isArray(profile.achievements) ? profile.achievements : String(profile.achievements).split('\n\n'))
                  .filter(a => a.trim() !== '')
                  .map((ach, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{renderSafe(ach)}</li>
                  ))}
              </ul>
            ) : (
              <p style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>No achievements added yet.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>📞 Connect</h3>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={infoTextStyle}><strong>Email:</strong> {renderSafe(profile.user?.email)}</p>
              <p style={infoTextStyle}><strong>Phone:</strong> {renderSafe(profile.phone)}</p>
              <p style={infoTextStyle}><strong>LinkedIn:</strong> {profile.linkedin ? <a href={renderSafe(profile.linkedin)} target="_blank" rel="noreferrer" style={{color:'#553f9a', fontWeight: '600'}}>View Profile ↗</a> : "N/A"}</p>
              <p style={infoTextStyle}><strong>GitHub:</strong> {profile.githubUsername ? <a href={`https://github.com/${renderSafe(profile.githubUsername)}`} target="_blank" rel="noreferrer" style={{color:'#553f9a', fontWeight: '600'}}>@{renderSafe(profile.githubUsername)} ↗</a> : "N/A"}</p>
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>📄 Professional Resume</h3>
            <div style={{ marginTop: '15px' }}>
              {profile.resumeUrl ? (
                <a href={`${API_URL}${renderSafe(profile.resumeUrl)}`} target="_blank" rel="noreferrer" style={{...btnStyle, display:'inline-block'}}>Download Resume</a>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed #ccc', borderRadius: '10px' }}>
                  <p style={{color: '#999', fontSize: '13px', margin: '0 0 10px 0'}}>Resume upload nahi hai.</p>
                  <button onClick={onEdit} style={{ background: 'none', border: 'none', color: '#553f9a', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Upload Now</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🟢 DASHBOARD COMPONENT
const StudentPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("profile"); 
  const [viewLevel, setViewLevel] = useState("COMPANY_LIST"); 
  const [profile, setProfile] = useState(null);
  const [jobsData, setJobsData] = useState([]); 
  const [credits, setCredits] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); 

  const fetchDashboardData = async () => {
    if (!token) { navigate("/login/student"); return; }
    setLoading(true);
    try {
      // ✅ FIX: Added "/api" prefix to all routes
      const profRes = await axios.get(`${API_URL}/api/student/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setProfile(profRes.data);

      const jobRes = await axios.get(`${API_URL}/api/jobs/all`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setJobsData(Array.isArray(jobRes.data) ? jobRes.data : []);

      try {
        const credRes = await axios.get(`${API_URL}/api/auth/user-credits`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setCredits(credRes.data.credits || 0);
      } catch (e) {
        if(profRes.data?.user?.credits !== undefined) setCredits(profRes.data.user.credits);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      // ✅ FIX: If profile not found, send to profile completion
      if (err.response && err.response.status === 404) { 
        navigate("/student/profile"); 
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, navigate]);

  const uniqueCompanies = Array.from(new Set(jobsData.map(j => j.company?._id)))
    .map(id => jobsData.find(j => j.company?._id === id)?.company)
    .filter(c => c !== undefined);

  const handleApply = async (jobId) => {
    try {
      setIsApplying(true);
      // ✅ FIX: Added "/api" prefix
      const res = await axios.post(`${API_URL}/api/assessment/start/${jobId}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data && res.data.attemptId) { navigate(`/assessment/${res.data.attemptId}`); } 
      else { alert("Failed to generate assessment attempt."); }
    } catch (error) {
      if (error.response && error.response.status === 402) { setShowPaymentModal(true); } 
      else if (error.response && error.response.status === 400) { alert("⚠️ You have already completed the assessment for this role."); } 
      else { alert(error.response?.data?.message || "Error starting the assessment."); }
    } finally { setIsApplying(false); }
  };

  if (loading) return <div style={loaderStyle}>Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8faff', fontFamily: 'Inter, sans-serif' }}>
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSuccess={() => { setShowPaymentModal(false); fetchDashboardData(); if (selectedJob) handleApply(selectedJob._id); }} />

      <aside style={sidebarStyle}>
        <div style={{ fontSize: '26px', fontWeight: '900', marginBottom: '50px', color: '#fff' }}>SkilledLink</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{ ...sideBtnStyle, background: activeTab === 'profile' ? 'rgba(255,255,255,0.15)' : 'transparent' }} onClick={() => setActiveTab('profile')}>👤 My Profile</button>
          <button style={{ ...sideBtnStyle, background: activeTab === 'jobs' ? 'rgba(255,255,255,0.15)' : 'transparent' }} onClick={() => { setActiveTab('jobs'); setViewLevel("COMPANY_LIST"); }}>🏢 Job Board</button>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} style={logoutBtnStyle}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '50px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#2d1f6e', fontSize: '32px', fontWeight: '900' }}>{activeTab === 'profile' ? 'My Profile' : 'Opportunities'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: credits < 10 ? "#fee2e2" : "linear-gradient(135deg, #553f9a, #7b5fc4)", color: credits < 10 ? "#dc2626" : "white", padding: "8px 18px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>🪙</span>
                <div style={{ textAlign: 'left' }}><div style={{ fontSize: "10px", opacity: 0.9, textTransform: "uppercase", fontWeight: 'bold' }}>Available Credits</div><div style={{ fontSize: "20px", fontWeight: "900", lineHeight: '1' }}>{credits}</div></div>
              </div>
              <button onClick={() => setShowPaymentModal(true)} style={{ background: '#f3f0ff', color: '#553f9a', border: '1px solid #ede8fb', padding: '12px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>+ Add</button>
            </div>
          </header>

          {activeTab === 'profile' && <ProfileView profile={profile} onEdit={() => navigate("/student/profile")} />}
          
          {activeTab === 'jobs' && (
            <>
              {viewLevel === "COMPANY_LIST" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                  {uniqueCompanies.length > 0 ? uniqueCompanies.map((comp) => (
                    <div key={comp._id} style={cardStyle} onClick={() => { setSelectedCompany(comp); setViewLevel("JOB_LIST"); }}>
                      <div style={{ fontSize: '45px', marginBottom: '15px' }}>🏢</div>
                      <h3 style={{ color: '#2d1f6e', margin: '0 0 5px 0' }}>{comp.companyName || comp.name}</h3>
                      <p style={{ color: '#553f9a', fontWeight: 'bold', fontSize: '14px' }}>{comp.industry || "Technology"}</p>
                      {comp.description && (
                        <p style={{ color: '#666', fontSize: '13px', marginTop: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {comp.description}
                        </p>
                      )}
                      <p style={{ color: '#999', fontSize: '13px', marginTop: '10px' }}>📍 {comp.location || "Multiple Locations"}</p>
                      <button style={viewBtnStyle}>View Openings</button>
                    </div>
                  )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}><h3 style={{ color: '#553f9a' }}>No companies are currently hiring.</h3></div>}
                </div>
              )}

              {viewLevel === "JOB_LIST" && (
                <div>
                  <button onClick={() => setViewLevel("COMPANY_LIST")} style={backLinkStyle}>← Back to All Companies</button>
                  <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #ede8fb', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h2 style={{ color: '#2d1f6e', margin: '0 0 10px 0' }}>About {selectedCompany?.companyName || selectedCompany?.name}</h2>
                        <p style={{ color: '#553f9a', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                          {selectedCompany?.industry} • {selectedCompany?.location}
                        </p>
                      </div>
                      {selectedCompany?.website && (
                        <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" style={{ background: '#f3f0ff', color: '#553f9a', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          🌐 Visit Website ↗
                        </a>
                      )}
                    </div>
                    {selectedCompany?.description && (
                      <p style={{ color: '#444', lineHeight: '1.6', fontSize: '15px', marginTop: '15px', whiteSpace: 'pre-line' }}>
                        {selectedCompany.description}
                      </p>
                    )}
                  </div>

                  <h3 style={{ color: '#2d1f6e', marginBottom: '20px' }}>Available Openings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {jobsData.filter(j => j.company?._id === selectedCompany?._id).map((job) => (
                      <div key={job._id} style={{ ...cardStyle, borderLeft: '6px solid #553f9a' }} onClick={() => { setSelectedJob(job); setViewLevel("JOB_DETAILS"); }}>
                        <h3 style={{ color: '#2d1f6e', margin: '0 0 10px 0' }}>{job.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}><span>💰 {job.salary}</span><span>💼 {job.experience}</span></div>
                        <button style={{ ...viewBtnStyle, background: '#f3f0ff', marginTop: '15px' }}>Check Details</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewLevel === "JOB_DETAILS" && (
                <div style={cardStyle}>
                  <button onClick={() => setViewLevel("JOB_LIST")} style={backLinkStyle}>← Back to All Roles</button>
                  <div style={detailHeaderStyle}>
                    <div style={{ flex: 1 }}>
                      <h1 style={{ margin: 0, color: '#2d1f6e' }}>{selectedJob.title}</h1>
                      <p style={{ color: '#553f9a', fontWeight: 'bold', fontSize: '18px' }}>{selectedCompany?.companyName || selectedCompany?.name}</p>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}><span style={badgeStyle}>Exp: {selectedJob.experience}</span><span style={badgeStyle}>Salary: {selectedJob.salary}</span></div>
                    </div>
                    <button style={{ ...applyBtnStyle, opacity: isApplying ? 0.7 : 1 }} onClick={() => handleApply(selectedJob._id)} disabled={isApplying}>{isApplying ? "Starting..." : "Apply Now 🚀"}</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
                    <div>
                      <h4 style={{ color: '#2d1f6e', marginBottom: '10px' }}>Role Description</h4><p style={descTextStyle}>{selectedJob.description}</p>
                      {selectedJob.skills && selectedJob.skills.length > 0 && (<div style={{ marginTop: '20px' }}><h4 style={{ color: '#2d1f6e', marginBottom: '10px' }}>Required Skills</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{selectedJob.skills.map((s, i) => <span key={i} style={tagStyle}>{s}</span>)}</div></div>)}
                    </div>
                    <div style={assessmentBoxStyle}>
                      <h4 style={{ margin: '0 0 15px 0', color: '#2d1f6e' }}>Assessment Rounds</h4>
                      <div style={roundCardStyle}>📂 1. Project Review</div>
                      {selectedJob.quiz?.length > 0 && <div style={{ ...roundCardStyle, color: '#1890ff' }}>🧠 2. Aptitude Quiz ({selectedJob.quiz.length} Qs)</div>}
                      {selectedJob.coding?.length > 0 && <div style={{ ...roundCardStyle, color: '#531dab' }}>💻 3. Coding Round ({selectedJob.coding.length} Problems)</div>}
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>*You must clear each round to proceed.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Styles (same as before)
const sidebarStyle = { width: '280px', background: '#553f9a', padding: '40px 20px', display: 'flex', flexDirection: 'column', boxShadow: '5px 0 15px rgba(0,0,0,0.05)' };
const sideBtnStyle = { padding: '16px 20px', textAlign: 'left', border: 'none', color: '#fff', borderRadius: '14px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '24px', border: '1.5px solid #ede8fb', boxShadow: '0 8px 24px rgba(85,63,154,0.04)', cursor: 'pointer', transition: '0.3s' };
const cardTitleStyle = { margin: '0 0 15px 0', fontSize: '19px', color: '#2d1f6e', borderBottom: '2px solid #f3f0ff', paddingBottom: '12px', fontWeight: '800' };
const viewBtnStyle = { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', border: 'none', background: '#f8faff', color: '#553f9a', fontWeight: 'bold', cursor: 'pointer' };
const backLinkStyle = { background: 'none', border: 'none', color: '#553f9a', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginBottom: '20px' };
const applyBtnStyle = { background: 'linear-gradient(135deg,#553f9a,#7b5fc4)', color: '#fff', border: 'none', padding: '16px 35px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.2s' };
const detailHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f0ff', paddingBottom: '25px', marginBottom: '25px', marginTop: '10px' };
const assessmentBoxStyle = { background: '#f8faff', padding: '20px', borderRadius: '20px', border: '1px solid #ede8fb' };
const roundCardStyle = { background: '#fff', padding: '12px 15px', borderRadius: '10px', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #ede8fb' };
const descTextStyle = { color: '#444', lineHeight: '1.7', background: '#f8faff', padding: '15px', borderRadius: '12px', whiteSpace: 'pre-line' };
const badgeStyle = { background: '#f3f0ff', color: '#553f9a', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' };
const tagStyle = { background: '#f3f0ff', color: '#553f9a', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' };
const btnStyle = { background: 'linear-gradient(135deg,#553f9a,#7b5fc4)', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', textAlign: 'center' };
const editBtnStyle = { background: '#f3f0ff', color: '#553f9a', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' };
const infoTextStyle = { margin: '8px 0', fontSize: '14px', color: '#444' };
const logoutBtnStyle = { marginTop: 'auto', padding: '12px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' };
const loaderStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#553f9a', fontWeight: 'bold', fontSize: '18px' };

export default StudentPage;