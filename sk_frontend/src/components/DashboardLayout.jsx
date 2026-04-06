import { useState, useEffect } from 'react';
import axios from 'axios';

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
  // Tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  // 🟢 Global Jobs State
  const [jobs, setJobs] = useState([]);
  // pausedJobs ab alag se rakhne ki zaroorat nahi hai agar backend har job ke andar isPaused: true/false bhej raha hai, 
  // lekin UI toggle instant dikhane ke liye hum isse maintain kar sakte hain.
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

  const BASE_URL = "http://localhost:5000/api";
  const getToken = () => localStorage.getItem("token");

  // ==========================================
  // 🟢 API CALL: Fetch Jobs on Load
  // ==========================================
  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/jobs`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const fetchedJobs = res.data.jobs || res.data || [];
      setJobs(fetchedJobs);

      // Backend se jo jobs 'paused' aayin hain unko Set me dalna
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
      // 🛠️ API URL UPDATE: Pichli baar humne /toggle define kiya tha backend route ke liye
      const res = await axios.patch(`${BASE_URL}/jobs/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      // Update frontend state instantly
      setPausedJobs(prev => {
        const n = new Set(prev);
        // Agar response me exact boolean aayi hai toh wo use karein, warna flip karein
        const newStatus = res.data.isPaused !== undefined ? res.data.isPaused : !n.has(id);
        newStatus ? n.add(id) : n.delete(id);
        return n;
      });

      // Update the main jobs array as well to keep data in sync
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
      await axios.delete(`${BASE_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setSuccessMsg("Job removed successfully ✅");
      setTimeout(() => setSuccessMsg(""), 3000);

      // Remove from UI instantly
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
            jobs={jobs} // Passing the global jobs list
            pausedJobs={pausedJobs}
            successMsg={successMsg}
            onShowModal={() => setShowModal(true)}
            onRemoveJob={handleRemoveJob} // Passing the global delete function
            onTogglePause={togglePause} // Passing the global toggle function
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
            setTalentSkill={setTalentSkill}
            talentMin={talentMin}
            setTalentMin={setTalentMin}
            onStudentClick={setPortfolioStudent}
          />
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* 🟢 Hire Modal */}
      {showModal && (
        <HireModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchJobs(); // Nayi job post hone ke baad Global State ko refresh karo
            setSuccessMsg("Job successfully posted! 🎉");
            setTimeout(() => setSuccessMsg(""), 4000);
            setActiveTab("hired"); // Automatically switch to jobs tab
          }}
        />
      )}

      {/* History Modal */}
      {historyJob && !selectedApp && (
        <HistoryModal
          historyJob={historyJob}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          onSelectApplicant={setSelectedApp}
          onClose={closeHistory}
        />
      )}

      {/* Student Detail Modal */}
      {selectedApp && (
        <StudentDetailModal
          applicant={selectedApp}
          onBack={() => setSelectedApp(null)}
          onClose={closeHistory}
        />
      )}

      {/* Portfolio Modal */}
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