import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://skilledlink-f4lp.onrender.com";

// 🚀 1. UPDATE: Expired Badge Logic yahan bhi laga diya!
const DurationBadge = ({ daysLeft }) => {
  if (daysLeft <= 0) {
    return (
      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", border: "1px solid #fca5a5" }}>
        🔴 Expired / Closed
      </span>
    );
  }
  return (
    <span style={{ background: "#e6f7ff", color: "#1890ff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
      ⏳ {daysLeft} Days Left
    </span>
  );
};

const HiredTab = ({
  onShowModal,
  onOpenHistory 
}) => {

  const [jobs, setJobs] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  
  // 🚀 STATE: Company ke credits store karne ke liye
  const [companyCredits, setCompanyCredits] = useState(0); 
  const [isPaying, setIsPaying] = useState(false); 
  const [showPricing, setShowPricing] = useState(false); // 👈 Modal dikhane ke liye naya state

  const getToken = () => localStorage.getItem("token");

  // 🚀 PRICING PACKAGES
  const packages = [
    { id: 1, name: "Starter", price: 1000, credits: 800, jobs: 8, color: "#1890ff", bg: "#e6f7ff" },
    { id: 2, name: "Growth", price: 2000, credits: 2000, jobs: 20, color: "#52c41a", bg: "#f6ffed", popular: true },
    { id: 3, name: "Pro", price: 3500, credits: 4000, jobs: 40, color: "#722ed1", bg: "#f9f0ff" }
  ];

  // ✅ FETCH JOBS & CREDITS
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Jobs
      const jobRes = await axios.get(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setJobs(jobRes.data.jobs || jobRes.data || []);

      // 2. Fetch Company Credits
      try {
        const creditRes = await axios.get(`${API_URL}/api/payment/credits`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (creditRes.data && creditRes.data.credits !== undefined) {
          setCompanyCredits(creditRes.data.credits);
        }
      } catch (creditErr) {
        console.log("Could not fetch credits", creditErr);
      }

    } catch (err) {
      console.log("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🚀================ RAZORPAY INTEGRATION ================🚀
  const handlePayment = async (planAmount, planCredits) => {
    try {
      setIsPaying(true);
      setShowPricing(false); 
      
      // 1. Backend se Razorpay Order create karein
      const orderRes = await axios.post(`${API_URL}/api/payment/create-order`, 
        { amount: planAmount }, 
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );

      const orderData = orderRes.data;

      // 2. Razorpay Checkout Options
      const options = {
        key: "rzp_test_SSG3SZQ2sAIrTe", 
        amount: orderData.amount,
        currency: "INR",
        name: "SkillSync Platform",
        description: `Purchase ${planCredits} Job Credits`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Payment Verify karein
            const verifyRes = await axios.post(`${API_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              creditsToAdd: planCredits 
            }, {
              headers: { Authorization: `Bearer ${getToken()}` }
            });

            // 4. Check status and update UI
            if (verifyRes.status === 200) {
              setSuccessMsg(`Payment Successful! ${planCredits} Credits added. 🎉`);
              setCompanyCredits(verifyRes.data.credits || (companyCredits + planCredits));
              setTimeout(() => setSuccessMsg(""), 4000);
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Payment verification failed! Please contact support.");
          }
        },
        prefill: {
          name: "Company HR", 
          email: "hr@company.com", 
        },
        theme: {
          color: "#553f9a" 
        }
      };

      // 4. Razorpay ka window open karein
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed. Reason: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Could not start payment. Is backend running?");
    } finally {
      setIsPaying(false);
    }
  };

  // 🚀 HIRE CLICK HANDLER
  const handleHireClick = () => {
    const postCost = 100; 
    if (companyCredits < postCost) {
      setShowPricing(true);
    } else {
      onShowModal();
    }
  };

  // ✅ DELETE JOB
  const handleRemoveJob = async (id) => {
    if (!window.confirm("Are you sure you want to remove this position? All applicant data linked to it might be affected.")) return;
    try {
      await axios.delete(`${API_URL}/api/jobs/${id}`, { headers: { Authorization: `Bearer ${getToken()}` }});
      setSuccessMsg("Job removed successfully ✅");
      setTimeout(() => setSuccessMsg(""), 3000); 
      setJobs(prevJobs => prevJobs.filter(job => job._id !== id && job.id !== id));
    } catch (err) {
      console.log("Error deleting job:", err);
      alert("Failed to delete job.");
    }
  };

  // ✅ PAUSE / RESUME 
  const handleTogglePause = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/api/jobs/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${getToken()}` }});
      setJobs(prevJobs => prevJobs.map(job => (job._id === id || job.id === id) ? { ...job, isPaused: res.data.isPaused ?? !job.isPaused } : job));
    } catch (err) {
      console.log("Error toggling status:", err);
      alert("Status update failed. Please try again.");
    }
  };

  const handleOpenHistory = (job) => {
    if (onOpenHistory) onOpenHistory(job);
  };

  // 🚀 2. UPDATE: Sort logic to push expired/paused to bottom
  const sortedJobs = [...jobs].sort((a, b) => {
    const aIsInactive = a.isPaused || a.daysLeft <= 0;
    const bIsInactive = b.isPaused || b.daysLeft <= 0;
    return aIsInactive === bIsInactive ? 0 : aIsInactive ? 1 : -1;
  });

  return (
    <div className="content-box posted-jobs-box" style={{ position: "relative" }}>

      {/* 🚀================ PRICING MODAL ================🚀 */}
      {showPricing && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", 
          justifyContent: "center", alignItems: "center", padding: "20px"
        }}>
          <div style={{
            background: "#fff", padding: "30px", borderRadius: "12px", 
            maxWidth: "800px", width: "100%", textAlign: "center", position: "relative",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <button 
              onClick={() => setShowPricing(false)}
              style={{ position: "absolute", top: "15px", right: "20px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
            >✖</button>
            
            <h2 style={{ color: "#553f9a", marginBottom: "10px" }}>Unlock More Job Posts 🪙</h2>
            <p style={{ color: "#666", marginBottom: "30px" }}>You need 100 credits to post a new job. Choose a package to recharge your balance.</p>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
              {packages.map(pkg => (
                <div key={pkg.id} style={{
                  background: pkg.bg, border: `2px solid ${pkg.color}`, padding: "25px", 
                  borderRadius: "10px", width: "220px", position: "relative",
                  boxShadow: pkg.popular ? "0 8px 20px rgba(0,0,0,0.15)" : "none",
                  transform: pkg.popular ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s ease"
                }}>
                  {pkg.popular && <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: pkg.color, color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>Most Popular</span>}
                  
                  <h3 style={{ margin: "0 0 10px 0", color: pkg.color }}>{pkg.name}</h3>
                  <h2 style={{ fontSize: "28px", margin: "0 0 5px 0", color: "#333" }}>₹{pkg.price}</h2>
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", fontWeight: "bold" }}>{pkg.jobs} Job Posts <br/><span style={{ fontSize: "12px", fontWeight: "normal" }}>({pkg.credits} Credits)</span></p>
                  
                  <button 
                    onClick={() => handlePayment(pkg.price, pkg.credits)}
                    style={{ width: "100%", background: pkg.color, color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "0.2s opacity" }}
                    onMouseOver={(e) => e.target.style.opacity = 0.8}
                    onMouseOut={(e) => e.target.style.opacity = 1}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="hired-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="hired-title-group">
          <h2>All Posted Positions</h2>
          <span className="jobs-count">{jobs.length}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            background: "#fff", border: "1px solid #e0d9f5", padding: "8px 15px", 
            borderRadius: "20px", fontSize: "14px", fontWeight: "bold", color: "#553f9a",
            boxShadow: "0 4px 10px rgba(85,63,154,0.08)", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span style={{ fontSize: "18px" }}>🪙</span> 
            <span>{companyCredits} Credits</span>
          </div>

          <button 
            className="hire-btn" 
            onClick={handleHireClick}
            disabled={isPaying}
            style={{ opacity: isPaying ? 0.7 : 1 }}
          >
            {isPaying ? "Processing..." : "+ Hire"}
          </button>
        </div>
      </div>

      {successMsg && <div className="post-success" style={{ color: '#16a34a', background: '#dcfce7', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontWeight: "bold", border: '1px solid #bbf7d0' }}>{successMsg}</div>}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#553f9a", fontWeight: "bold" }}>Loading your jobs... ⏳</div>
      ) : sortedJobs.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#888", border: "1px dashed #ccc", borderRadius: "10px", marginTop: "20px" }}>
          You haven't posted any jobs yet. Click "+ Hire" to get started!
        </div>
      ) : (
        sortedJobs.map(job => {
          const jobId = job._id || job.id;
          
          // 🚀 3. UPDATE: Expired logic (job.isExpired ko check karna zaruri nahi, daysLeft check karna safe hai)
          const isExpired = job.daysLeft <= 0;
          const paused = job.isPaused || isExpired; 

          return (
            <div
              key={jobId}
              className="job-card"
              style={{
                opacity: paused ? 0.55 : 1,
                background: paused ? "#f5f5f7" : "#fff",
                transition: "0.3s",
                position: "relative",
                border: isExpired ? "1px solid #fca5a5" : "1px solid #eee", 
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px"
              }}
            >
              {paused && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "8px",
                  background: "repeating-linear-gradient(135deg,transparent,transparent 8px,rgba(0,0,0,0.015) 8px,rgba(0,0,0,0.015) 16px)",
                  pointerEvents: "none"
                }} />
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, color: paused ? "#999" : "#553f9a" }}>{job.title}</h3>

                  {job.isPaused && !isExpired && (
                    <span style={{ background: "#e5e5ea", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", display: "flex", alignItems: "center", color: "#666", fontWeight: "bold" }}>
                      ⏸ Paused
                    </span>
                  )}
                </div>

                {job.daysLeft !== undefined && <DurationBadge daysLeft={job.daysLeft} />}
              </div>

              <div className="job-meta" style={{ marginBottom: "10px", color: "#555", fontSize: "14px" }}>
                <span style={{ marginRight: "15px" }}><strong>Experience:</strong> {job.experience || "Not specified"}</span>
                <span><strong>Salary:</strong> {job.salary || "Not specified"}</span>
              </div>

              <p style={{ marginBottom: "10px", fontSize: "14px", color: "#444" }}>
                <strong>Description:</strong> {job.description || "No description provided."}
              </p>

              {job.skills && job.skills.length > 0 && (
                <p style={{ marginBottom: "10px" }}>
                  <strong>Skills:</strong>{" "}
                  {job.skills.map((s, i) => (
                    <span key={i} className="tag" style={{ background: "#f0f0f0", color: "#333", padding: "4px 8px", borderRadius: "4px", marginRight: "5px", fontSize: "12px", display: "inline-block", marginBottom: "4px" }}>{s}</span>
                  ))}
                </p>
              )}

              {job.languages && job.languages.length > 0 && (
                <p style={{ marginBottom: "15px" }}>
                  <strong>Languages:</strong>{" "}
                  {job.languages.map((l, i) => (
                    <span key={i} className="tag" style={{ background: "#f0f0f0", color: "#333", padding: "4px 8px", borderRadius: "4px", marginRight: "5px", fontSize: "12px", display: "inline-block", marginBottom: "4px" }}>{l}</span>
                  ))}
                </p>
              )}

              <div className="job-badges" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                {job.quiz && job.quiz.length > 0 && (
                  <span className="quiz-badge" style={{ background: "#e6f7ff", color: "#1890ff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                    ✅ {job.quiz.length} Quiz
                  </span>
                )}
                {job.coding && job.coding.length > 0 && (
                  <span className="coding-badge" style={{ background: "#f9f0ff", color: "#531dab", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                    💻 {job.coding.length} Coding
                  </span>
                )}
              </div>

              <div className="job-card-actions" style={{ display: "flex", gap: "10px", position: "relative", zIndex: 2, flexWrap: "wrap" }}>
                <button
                  className="delete-btn"
                  onClick={() => handleRemoveJob(jobId)}
                  style={{ background: "#ff4d4f", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Remove
                </button>

                <button
                  onClick={() => handleTogglePause(jobId)}
                  style={{
                    padding: "8px 16px", borderRadius: "6px",
                    background: job.isPaused ? "#553f9a" : "#f3f0ff",
                    color: job.isPaused ? "#fff" : "#553f9a",
                    cursor: isExpired ? "not-allowed" : "pointer", 
                    border: "none", fontWeight: "bold"
                  }}
                  disabled={isExpired} 
                  title={isExpired ? "Job is expired. You cannot resume it." : ""}
                >
                  {job.isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>

                <button
                  className="history-btn"
                  onClick={() => handleOpenHistory(job)}
                  style={{ background: "#1890ff", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginLeft: "auto" }}
                >
                  📋 Applicants History
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default HiredTab;