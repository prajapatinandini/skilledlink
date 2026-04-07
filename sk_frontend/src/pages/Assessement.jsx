import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Proctoring from "../components/Proctoring"; 

const Assessment = () => {
  const navigate = useNavigate();
  const { testId: attemptIdFromUrl } = useParams();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const [phase, setPhase] = useState("projects");
  const [attemptId, setAttemptId] = useState(attemptIdFromUrl);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing Please Wait... ⏳");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittedProjectId, setSubmittedProjectId] = useState(null);

  // --- PHASE 1: Projects State ---
  const [projects, setProjects] = useState([{ title: "", url: "" }]);

  // --- PHASE 2: MCQ States ---
  const [mcqData, setMcqData] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200);

  // --- PHASE 3: Coding States ---
  const [codingProblems, setCodingProblems] = useState([]);
  const [codingIndex, setCodingIndex] = useState(0);
  const [codes, setCodes] = useState([]);
  const [codingTimeLeft, setCodingTimeLeft] = useState(2700);

  // --- PHASE 4: Result State ---
  const [finalResult, setFinalResult] = useState(null);

  // --- 🚨 ANTI-CHEAT STATES 🚨 ---
  const [triggerAutoSubmit, setTriggerAutoSubmit] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0); // 👈 New State

  // --- Timer Logic ---
  useEffect(() => {
    if (phase === "projects" || phase === "result" || loading || showPaymentModal) return;

    if (phase === "mcq" && timeLeft <= 0) {
      submitAptitudePhase();
      return;
    }

    if (phase === "coding" && codingTimeLeft <= 0) {
      submitCodingPhase();
      return;
    }

    const timer = setInterval(() => {
      if (phase === "mcq") setTimeLeft((prev) => prev - 1);
      if (phase === "coding") setCodingTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, codingTimeLeft, phase, loading, showPaymentModal]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ══════════════════════════════════
      🚨 AI PROCTORING WARNING HANDLER
  ══════════════════════════════════ */
  // 👈 New Function: AI violations ko handle karne ke liye
  const handleCheatWarning = (count, reason) => {
    setProctorWarnings(count);
    console.warn(`Proctoring Violation: ${reason}`);
    
    if (count >= 3) {
      setTriggerAutoSubmit(true); // 3 warning par auto-submit trigger
    }
  };

  /* ══════════════════════════════════
      🚨 ULTRA-STRICT ANTI-CHEAT LOGIC
  ══════════════════════════════════ */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !loading && !showPaymentModal && (phase === "mcq" || phase === "coding")) {
        setTriggerAutoSubmit(true);
      }
    };

    const handleWindowBlur = () => {
      if (!loading && !showPaymentModal && (phase === "mcq" || phase === "coding")) {
        setTriggerAutoSubmit(true);
      }
    };

    const handleResize = () => {
      if (!loading && !showPaymentModal && (phase === "mcq" || phase === "coding")) {
        if (window.innerWidth < window.screen.width - 100) {
          alert("⚠️ SPLIT SCREEN DETECTED! Please keep the window in Full-Screen mode, otherwise the test will be submitted automatically.");
        }
      }
    };

    const handleKeyDown = (e) => {
      if (phase === "mcq" || phase === "coding") {
        if (e.key === "PrintScreen") {
          navigator.clipboard.writeText("");
          alert("🚨 Screenshots are strictly disabled!");
          e.preventDefault();
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
          alert("🚨 Screenshot shortcuts are disabled!");
          e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, loading, showPaymentModal]);

  useEffect(() => {
  if (triggerAutoSubmit) {
    // ❌ alert() hata diya, ab seedha submit ya result dikhayenge
    if (phase === "mcq") {
      submitAptitudePhase();
    } else if (phase === "coding") {
      submitCodingPhase();
    }
    setTriggerAutoSubmit(false);
  }
}, [triggerAutoSubmit, phase]);

  const handlePreventDefault = (e) => {
    if (phase === "mcq" || phase === "coding") {
      e.preventDefault();
      alert("⚠️ Copy, paste, and right-click are disabled during the assessment.");
    }
  };

  /* ══════════════════════════════════
      💳 RAZORPAY PAYMENT LOGIC
  ══════════════════════════════════ */
  const handlePayment = async (amount, creditsToAdd) => {
    try {
      setLoading(true);
      setLoadingText("Initializing Payment... 💳");
      const { data: order } = await axios.post(`${API_URL}/api/payment/create-order`, { amount }, getAuthHeader());
      const options = {
        key: "rzp_test_SSG3SZQ2sAIrTe", 
        amount: order.amount,
        currency: order.currency,
        name: "SkillEdLink",
        description: `Buy ${creditsToAdd} Credits`,
        order_id: order.id,
        handler: async function (response) {
          try {
            setLoadingText("Verifying Payment... 🔄");
            await axios.post(`${API_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              creditsToAdd: creditsToAdd
            }, getAuthHeader());
            alert(`🎉 Success! ${creditsToAdd} credits have been added to your account.`);
            setShowPaymentModal(false);
            startMCQPhase(); 
          } catch (err) {
            alert("Payment verification failed! Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#553f9a" },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Failed to load payment gateway. Please check your internet connection.");
      setLoading(false);
    }
  };

  /* ══════════════════════════════════
      PHASE 1: PROJECT FUNCTIONS
  ══════════════════════════════════ */
  const handleProjectChange = (i, field, value) => {
    const newProjects = [...projects];
    newProjects[i][field] = value;
    setProjects(newProjects);
  };

  const addProject = () => {
    setProjects([...projects, { title: "", url: "" }]);
  };

  const removeProject = (i) => {
    const newProjects = projects.filter((_, idx) => idx !== i);
    setProjects(newProjects);
  };

  const startMCQPhase = async () => {
    const validProjects = projects.filter(p => p.url.trim() !== "");
    if (validProjects.length === 0) {
      alert("Please enter a valid Project URL.");
      return;
    }
    try {
      setLoading(true);
      setLoadingText("Checking Credits & Starting Review... 🚀");
      const projectsPayload = validProjects.map(p => ({
        title: p.title,
        repoUrl: p.url,
        attemptId: attemptIdFromUrl 
      }));
      const addRes = await axios.post(`${API_URL}/api/projects/add-multiple`, {
        projects: projectsPayload
      }, getAuthHeader());
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
      }
      const projectIds = addRes.data.projects?.map(proj => proj._id) || addRes.data.projectIds || [];
      if (projectIds.length > 0) {
        setSubmittedProjectId(projectIds[0]);
        projectIds.forEach(id => {
          axios.post(`${API_URL}/api/evaluation/evaluate`, { projectId: id }, getAuthHeader())
            .then(res => console.log(`✅ AI Evaluation running for ${id}`))
            .catch(e => console.error(`⏳ AI Eval skipped for ${id}`));
        });
      }
      setLoadingText("Loading Aptitude Test... 📝");
      const aptRes = await axios.get(`${API_URL}/api/assessment/aptitude/${attemptIdFromUrl}`, getAuthHeader());
      if (aptRes.data && aptRes.data.questions) {
        setMcqData(aptRes.data.questions);
        setPhase("mcq");
      } else {
        throw new Error("No aptitude questions found for this test.");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      if (error.response && error.response.status === 402) {
        setShowPaymentModal(true); 
      } else {
        alert(error.response?.data?.message || error.message || "Error in starting assessment. Please try again.");
      }
    } finally {
      if(!showPaymentModal) setLoading(false);
    }
  };

  /* ══════════════════════════════════
      PHASE 2: MCQ FUNCTIONS
  ══════════════════════════════════ */
  const checkAns = (qId, selectedAnsIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: selectedAnsIndex });
  };

  const nextMCQ = () => {
    if (index === mcqData.length - 1) {
      submitAptitudePhase();
      return;
    }
    setIndex(index + 1);
  };

  const submitAptitudePhase = async () => {
    try {
      setLoading(true);
      setLoadingText("Saving MCQ Answers & Loading Coding Round... 💻");
      await axios.post(`${API_URL}/api/assessment/aptitude/submit/${attemptIdFromUrl}`, { answers: selectedAnswers }, getAuthHeader());
      const codeRes = await axios.get(`${API_URL}/api/assessment/coding/${attemptIdFromUrl}`, getAuthHeader());
      setCodingProblems(codeRes.data);
      setCodes(codeRes.data.map(q => q.defaultCode || "// Write your code here...\n"));
      setPhase("coding");
    } catch (error) {
      alert(error.response?.data?.message || "Aptitude Round Failed (Cutoff not met).");
      if (error.response?.status === 403) navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════
      PHASE 3: CODING FUNCTIONS
  ══════════════════════════════════ */
  const handleCodeChange = (e) => {
    const newCodes = [...codes];
    newCodes[codingIndex] = e.target.value;
    setCodes(newCodes);
  };

  const prevCodingProblem = () => {
    if (codingIndex > 0) setCodingIndex(codingIndex - 1);
  };

  const nextCodingProblem = () => {
    if (codingIndex === codingProblems.length - 1) {
      submitCodingPhase();
    } else {
      setCodingIndex(codingIndex + 1);
    }
  };

  const submitCodingPhase = async () => {
    try {
      setLoading(true);
      setLoadingText("Saving Coding Answers... 💾");
      const codingAnswers = codingProblems.map((prob, i) => ({
        questionId: prob._id,
        code: codes[i]
      }));
      await axios.post(`${API_URL}/api/assessment/coding/submit/${attemptIdFromUrl}`, { codingAnswers }, getAuthHeader());
      setLoadingText("Calculating MCQ & Coding Scores... 📊");
      const resultRes = await axios.get(`${API_URL}/api/assessment/result/${attemptIdFromUrl}`, getAuthHeader());
      setLoadingText("AI is finalizing your Project Score... 🤖 (Almost done!)");
      let realProjectScore = 0;
      let evalId = null; 
      let aiChecked = false;
      let retries = 10; 
      while (retries > 0 && !aiChecked) {
        try {
          const evalRes = await axios.get(`${API_URL}/api/evaluation/project/${submittedProjectId}`, getAuthHeader());
          if (evalRes.data) {
             evalId = evalRes.data._id || (evalRes.data.evaluation && evalRes.data.evaluation._id);
             realProjectScore = parseFloat(evalRes.data.finalScore || (evalRes.data.evaluation && evalRes.data.evaluation.finalScore) || 0);
             if(evalId) { aiChecked = true; } else { throw new Error("Score not ready yet"); }
          } else { throw new Error("Score not ready yet"); }
        } catch (e) {
          console.log(`⏳ AI is still calculating... Retries left: ${retries - 1}`);
          await new Promise(resolve => setTimeout(resolve, 3000)); 
          retries--;
        }
      }
      if (!aiChecked) { realProjectScore = 0; }
      setLoadingText("Generating Final Report... 🏆");
      const calculatedFinalScore = Math.round((realProjectScore * 0.35) + ((resultRes.data.aptitudeScore || 0) * 0.35) + ((resultRes.data.codingScore || 0) * 0.30));
      setLoadingText("Saving Final Results securely... 🔒");
      try {
        if (evalId) {
          await axios.post(`${API_URL}/api/dashboard/final-submit/${attemptIdFromUrl}`, {
            projectScore: realProjectScore,
            finalScore: calculatedFinalScore
          }, getAuthHeader());
        }
      } catch (submitErr) {
        console.error("Final submit API error:", submitErr);
      }
      setFinalResult({ ...resultRes.data, projectScore: realProjectScore, finalScore: calculatedFinalScore });
      setPhase("result");
    } catch (error) {
      console.error(error);
      alert("Failed to submit the coding assessment. Please try again.");
    } finally {
      setLoading(false);
      if (document.exitFullscreen) { document.exitFullscreen().catch(err => console.log(err)); }
    }
  };

  /* ══════════════════════════════════
      UI RENDER
  ══════════════════════════════════ */
  if (!attemptIdFromUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8faff', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ color: '#dc2626', fontSize: '32px', margin: '0 0 10px 0' }}>🚫 Invalid Link</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>Attempt ID is missing. Please go to the dashboard and reapply for the test.</p>
        <button onClick={() => navigate('/student')} style={{ background: '#553f9a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>← Go to Dashboard</button>
      </div>
    );
  }

  if (loading && !showPaymentModal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8faff', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚙️</div>
        <div style={{ color: '#553f9a', fontSize: '22px', fontWeight: 'bold' }}>{loadingText}</div>
        <p style={{ color: '#666', marginTop: '10px' }}>Please do not refresh the page...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .quiz-option { padding: 15px 20px; border: 1.5px solid #ede8fb; border-radius: 10px; margin-bottom: 12px; cursor: pointer; font-size: 15px; transition: 0.2s; background: #fff; color: #444; font-weight: 500; }
        .quiz-option:hover { background: #f3f0ff; border-color: #553f9a; }
        .quiz-option.selected { background: #553f9a; border-color: #553f9a; color: #fff; font-weight: bold; }
        .inp-field { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; margin-top: 5px; box-sizing: border-box; font-family: inherit; }
        .btn-primary { background: linear-gradient(135deg,#553f9a,#7b5fc4); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; transition: 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(85,63,154,0.3); }
        .btn-secondary { background: transparent; color: #553f9a; border: 2px solid #553f9a; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .btn-secondary:hover { background: #f3f0ff; }
        .no-select { user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; }
      `}</style>

      {/* 🚨 PROCTORING AI COMPONENT 🚨 */}
      {(phase === "mcq" || phase === "coding") && !loading && !showPaymentModal && (
        <Proctoring onCheatWarning={handleCheatWarning} maxWarnings={3} />
      )}

      {showPaymentModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "15px", textAlign: "center", maxWidth: "500px", width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#dc2626", margin: "0 0 10px 0" }}>Insufficient Credits! 🪙</h2>
            <p style={{ color: "#666", marginBottom: "30px" }}>You need at least 10 credits to start this assessment. Please recharge your account.</p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{ border: "1.5px solid #ede8fb", padding: "20px", borderRadius: "10px", flex: 1, background: "#f8faff" }}>
                <h3 style={{ color: "#2d1f6e", margin: "0 0 5px 0" }}>Starter Pack</h3>
                <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#666" }}>100 Credits</p>
                <button disabled={loading} onClick={() => handlePayment(99, 100)} style={{ background: "#553f9a", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>Pay ₹99</button>
              </div>
              <div style={{ border: "1.5px solid #ede8fb", padding: "20px", borderRadius: "10px", flex: 1, background: "#fcfbff" }}>
                <h3 style={{ color: "#2d1f6e", margin: "0 0 5px 0" }}>Pro Pack</h3>
                <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#666" }}>250 Credits</p>
                <button disabled={loading} onClick={() => handlePayment(199, 250)} style={{ background: "linear-gradient(135deg,#553f9a,#7b5fc4)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>Pay ₹199</button>
              </div>
            </div>
            <button onClick={() => { setShowPaymentModal(false); setLoading(false); }} style={{ background: "transparent", color: "#666", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: "14px" }}>Cancel & Go Back</button>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f8faff', display: 'flex', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div
          className={(phase === "mcq" || phase === "coding") ? "no-select" : ""}
          style={{ width: '100%', maxWidth: phase === "coding" ? '900px' : '700px', background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'max-width 0.3s ease' }}
          onCopy={handlePreventDefault}
          onPaste={handlePreventDefault}
          onContextMenu={handlePreventDefault}
        >
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#2d1f6e', margin: 0, fontSize: '24px' }}>
              {phase === "projects" && "Step 1: Project Submissions"}
              {phase === "mcq" && "Step 2: Aptitude & Technical Quiz"}
              {phase === "coding" && "Step 3: Coding Assessment"}
              {phase === "result" && "Assessment Result"}
            </h1>
            {(phase === "mcq" || phase === "coding") && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                ⏱ {phase === "mcq" ? formatTime(timeLeft) : formatTime(codingTimeLeft)}
              </div>
            )}
          </div>
          <hr style={{ border: 'none', borderTop: '2px solid #ede8fb', marginBottom: '30px' }} />

          {/* PHASE 1: PROJECTS */}
          {phase === "projects" && (
            <div>
              <p style={{ color: '#666', marginBottom: '20px' }}>Add your GitHub project URL.</p>
              {projects.map((proj, i) => (
                <div key={i} style={{ background: '#fcfbff', border: '1px solid #ede8fb', padding: '20px', borderRadius: '10px', marginBottom: '15px', position: 'relative' }}>
                  {projects.length > 1 && ( <button onClick={() => removeProject(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>X Remove</button> )}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#444' }}>Project Title {i + 1}</label>
                    <input className="inp-field" placeholder="e.g. E-Commerce Website" value={proj.title} onChange={(e) => handleProjectChange(i, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#444' }}>GitHub / Live URL {i + 1}</label>
                    <input className="inp-field" placeholder="https://github.com/..." value={proj.url} onChange={(e) => handleProjectChange(i, 'url', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addProject} style={{ background: 'transparent', color: '#553f9a', border: '1.5px dashed #553f9a', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '30px' }}>+ Add Another Project</button>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={startMCQPhase} className="btn-primary">Save & Start Quiz 🚀</button>
              </div>
            </div>
          )}

          {/* PHASE 2: MCQ QUIZ */}
          {phase === "mcq" && mcqData.length > 0 && (
            <div>
              <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '20px', lineHeight: '1.5' }}>
                <span style={{ color: '#553f9a' }}>Q{index + 1}.</span> {mcqData[index].questionText || mcqData[index].question}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {mcqData[index].options.map((opt, i) => (
                  <li key={i} onClick={() => checkAns(mcqData[index]._id, i)} className={`quiz-option ${selectedAnswers[mcqData[index]._id] === i ? 'selected' : ''}`}>{opt}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                <div style={{ color: '#666', fontWeight: 'bold', fontSize: '14px' }}>Question {index + 1} of {mcqData.length}</div>
                <button onClick={nextMCQ} className="btn-primary">{index === mcqData.length - 1 ? "Go to Coding Round →" : "Next Question"}</button>
              </div>
            </div>
          )}

          {/* PHASE 3: CODING */}
          {phase === "coding" && codingProblems.length > 0 && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {codingProblems.map((_, i) => (
                  <button key={i} onClick={() => setCodingIndex(i)} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: 'none', background: codingIndex === i ? '#553f9a' : '#f3f0ff', color: codingIndex === i ? '#fff' : '#553f9a' }}>Problem {i + 1}</button>
                ))}
              </div>
              <div style={{ background: '#f8faff', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #553f9a', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', color: '#2d1f6e', margin: '0 0 10px 0' }}>{codingProblems[codingIndex].title}</h2>
                <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                  {codingProblems[codingIndex].description || codingProblems[codingIndex].desc}
                  <br /><br />
                  <strong>Sample Input:</strong><br />
                  <span style={{ background: '#e2e8f0', padding: '5px 10px', borderRadius: '5px', display: 'inline-block', marginTop: '5px', marginBottom: '10px' }}>{codingProblems[codingIndex].sampleInput}</span>
                  <br /><strong>Sample Output:</strong><br />
                  <span style={{ background: '#e2e8f0', padding: '5px 10px', borderRadius: '5px', display: 'inline-block', marginTop: '5px' }}>{codingProblems[codingIndex].sampleOutput}</span>
                </p>
              </div>
              <textarea style={{ width: '100%', height: '300px', padding: '20px', fontFamily: 'monospace', background: '#1e293b', color: '#f8fafc', borderRadius: '10px', border: 'none', boxSizing: 'border-box', fontSize: '15px', resize: 'vertical' }} value={codes[codingIndex]} onChange={handleCodeChange} spellCheck="false"></textarea>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={prevCodingProblem} className="btn-secondary" style={{ visibility: codingIndex > 0 ? 'visible' : 'hidden' }}>← Previous</button>
                <button onClick={nextCodingProblem} className="btn-primary" style={{ background: codingIndex === codingProblems.length - 1 ? '#16a34a' : '' }}>{codingIndex === codingProblems.length - 1 ? "Submit Final Assessment ✔️" : "Next Problem →"}</button>
              </div>
            </div>
          )}

          {/* PHASE 4: RESULT */}
          {phase === "result" && finalResult && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '70px', marginBottom: '10px' }}>🎓</div>
              <h2 style={{ color: '#2d1f6e', fontSize: '30px', margin: '0 0 5px 0' }}>Assessment Submitted!</h2>
              <div style={{ background: '#f8faff', padding: '30px', borderRadius: '15px', border: '1px solid #ede8fb', maxWidth: '400px', margin: '0 auto 40px auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}><span>📂 Projects:</span><span>{finalResult.projectScore || 0}%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}><span>🧠 MCQ Quiz:</span><span>{finalResult.aptitudeScore || 0}%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}><span>💻 Coding:</span><span>{finalResult.codingScore || 0}%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', background: '#dcfce7', padding: '15px', borderRadius: '10px' }}><span style={{ color: '#16a34a', fontWeight: '900' }}>🏆 Aggregate:</span><span style={{ color: '#16a34a', fontWeight: '900' }}>{finalResult.finalScore || 0}%</span></div>
              </div>
              <button onClick={() => navigate('/student')} className="btn-secondary">← Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Assessment;