import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

import Sidebar from './Sidebar';
import DashboardTab from './tabs/DashboardTab';
import HiringTab from './tabs/HiringTab';
import HiredTab from './tabs/HiredTab';
import PlacementsTab from './tabs/PlacementsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import TalentPoolTab from './tabs/TalentPoolTab';
import HireModal from './modals/HireModal';
import HistoryModal from './modals/HistoryModal';
import StudentDetailModal from './modals/StudentDetailModal';
import PortfolioModal from './modals/PortfolioModal';

const DashboardLayout = () => {
  const navigate = useNavigate(); // 👈 NAYA 2: navigate ko define kiya

  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  // 🟢 Global Jobs State
  const [jobs, setJobs] = useState([]);
  const [pausedJobs, setPausedJobs] = useState(new Set());

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // History & Student Detail modal state
  const [historyJob, setHistoryJob] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  // Portfolio modal state
  const [portfolioStudent, setPortfolioStudent] = useState(null);

  // Talent pool filters
  const [talentSearch, setTalentSearch] = useState("");
  const [talentSkill, setTalentSkill] = useState("");
  const [talentMin, setTalentMin] = useState(0);

 
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 API CALL: Fetch Jobs on Load
  // ==========================================
  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const fetchedJobs = res.data.jobs || res.data || [];
      setJobs(fetchedJobs);

      const paused = new Set();
      fetchedJobs.forEach(job => {
        if (job.isPaused) paused.add(job._id || job.id);
      });
      setPausedJobs(paused);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ==========================================
  // 🟢 API CALL: Toggle Pause/Unpause Job
  // ==========================================
  const togglePause = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/jobs/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setPausedJobs(prev => {
        const n = new Set(prev);
        const newStatus = res.data.isPaused !== undefined ? res.data.isPaused : !n.has(id);
        newStatus ? n.add(id) : n.delete(id);
        return n;
      });

      setJobs(prevJobs => prevJobs.map(job => 
        (job._id === id || job.id === id) ? { ...job, isPaused: !job.isPaused } : job
      ));

    } catch (error) {
      console.error("Error toggling pause:", error);
      alert("Failed to change job status. Please try again.");
    }
  };

  // ==========================================
  // 🟢 API CALL: Delete/Remove Job
  // ==========================================
  const handleRemoveJob = async (id) => {
    if (!window.confirm("Are you sure you want to remove this position?")) return;

    try {
      await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setSuccessMsg("Job removed successfully ✅");
      setTimeout(() => setSuccessMsg(""), 3000);

      setJobs(jobs.filter(j => (j._id || j.id) !== id));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job.");
    }
  };

  // History modal handlers
  const openHistory = (job) => {
    setHistoryJob(job);
    setHistoryFilter("All");
    setSelectedApp(null);
  };

  const closeHistory = () => {
    setHistoryJob(null);
    setSelectedApp(null);
  };

  return (
    <div className="landing-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        
        {/* 👈 NAYA 3: TOP HEADER FOR UPDATE PROFILE BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #eaeaea' }}>
          <button 
            onClick={() => navigate("/company/create-profile")} 
            style={{ 
              background: '#f3f0ff', 
              color: '#553f9a', 
              padding: '10px 18px', 
              borderRadius: '10px', 
              border: '1px solid #ede8fb', 
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e9e3ff'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f3f0ff'}
          >
            ✏️ Update Profile
          </button>
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab
            jobs={jobs}
            onStudentClick={setPortfolioStudent}
          />
        )}

        {activeTab === "hiring" && (
          <HiringTab
            jobs={jobs}
            pausedJobs={pausedJobs}
            onOpenHistory={openHistory}
          />
        )}

        {activeTab === "hired" && (
          <HiredTab
            jobs={jobs}
            pausedJobs={pausedJobs}
            successMsg={successMsg}
            onShowModal={() => setShowModal(true)}
            onRemoveJob={handleRemoveJob}
            onTogglePause={togglePause}
            onOpenHistory={openHistory}
          />
        )}

        {activeTab === "placements" && <PlacementsTab />}

        {activeTab === "analytics" && <AnalyticsTab />}

        {activeTab === "talent" && (
          <TalentPoolTab
            talentSearch={talentSearch}
            setTalentSearch={setTalentSearch}
            talentSkill={talentSkill}
            talentMin={talentMin}
            setTalentMin={setTalentMin}
            onStudentClick={setPortfolioStudent}
          />
        )}
      </main>

      {/* ================= MODALS ================= */}

      {showModal && (
        <HireModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchJobs();
            setSuccessMsg("Job successfully posted! 🎉");
            setTimeout(() => setSuccessMsg(""), 4000);
            setActiveTab("hired"); 
          }}
        />
      )}

      {historyJob && !selectedApp && (
        <HistoryModal
          historyJob={historyJob}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          onSelectApplicant={setSelectedApp}
          onClose={closeHistory}
        />
      )}

      {selectedApp && (
        <StudentDetailModal
          applicant={selectedApp}
          onBack={() => setSelectedApp(null)}
          onClose={closeHistory}
        />
      )}

      {portfolioStudent && (
        <PortfolioModal
          student={portfolioStudent}
          onClose={() => setPortfolioStudent(null)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;