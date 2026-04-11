import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Proctoring from "../components/Proctoring"; 

const Assessment = () => {
  const navigate = useNavigate();
  const { testId: attemptIdFromUrl } = useParams();
  const API_URL = "https://skilledlink-f4lp.onrender.com";

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  // --- 🚨 SYSTEM & ANTI-CHEAT STATES ---
  const [isSystemReady, setIsSystemReady] = useState(false); 
  const [triggerAutoSubmit, setTriggerAutoSubmit] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);

  // --- GENERAL STATES ---
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

  // ================= 🚨 TIMER LOGIC =================
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

  // ================= 🚨 AI PROCTORING HANDLER =================
  const handleCheatWarning = (count, reason) => {
    setProctorWarnings(count);
    if (count >= 3) {
      setTriggerAutoSubmit(true); 
    }
  };

  // ================= 🚨 ULTRA-STRICT ANTI-CHEAT =================
  useEffect(() => {
    // 🚀 SAFETY BUFFER: Page load hone ke 3 second baad tracking chalu hogi
    const setupTimer = setTimeout(() => {
      if (phase === "mcq" || phase === "coding") {
        setIsSystemReady(true);
      }
    }, 3000);

    const handleViolation = () => {
      if (isSystemReady && !loading && !showPaymentModal && (phase === "mcq" || phase === "coding")) {
        setTriggerAutoSubmit(true);
      }
    };

    const handleVisibilityChange = () => { if (document.hidden) handleViolation(); };
    const handleWindowBlur = () => { handleViolation(); };

    const handleResize = () => {
      if (isSystemReady && !loading && !showPaymentModal && (phase === "mcq" || phase === "coding")) {
        if (window.innerWidth < window.screen.width - 100) {
          alert("⚠️ SPLIT SCREEN DETECTED! Keep in Full-Screen mode to avoid auto-submission.");
        }
      }
    };

    const handleKeyDown = (e) => {
      if (phase === "mcq" || phase === "coding") {
        if (e.key === "PrintScreen" || ((e.metaKey || e.ctrlKey) && e.shiftKey)) {
          navigator.clipboard.writeText("");
          alert("🚨 Screenshots are disabled!");
          e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(setupTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, isSystemReady, loading, showPaymentModal]);

  useEffect(() => {
    if (triggerAutoSubmit) {
      if (phase === "mcq") submitAptitudePhase();
      else if (phase === "coding") submitCodingPhase();
      setTriggerAutoSubmit(false);
    }
  }, [triggerAutoSubmit, phase]);

  const handlePreventDefault = (e) => {
    if (phase === "mcq" || phase === "coding") {
      e.preventDefault();
      alert("⚠️ Copy/Paste/Right-click is disabled.");
    }
  };

  // ================= 💳 RAZORPAY LOGIC =================
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
            alert(`🎉 Success! Credits added.`);
            setShowPaymentModal(false);
            startMCQPhase(); 
          } catch (err) {
            alert("Payment verification failed!");
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
      alert("Failed to load payment.");
      setLoading(false);
    }
  };

  // ================= 📂 PHASE 1: PROJECTS =================
  const handleProjectChange = (i, field, value) => {
    const newProjects = [...projects];
    newProjects[i][field] = value;
    setProjects(newProjects);
  };
  const addProject = () => setProjects([...projects, { title: "", url: "" }]);
  const removeProject = (i) => setProjects(projects.filter((_, idx) => idx !== i));

  const startMCQPhase = async () => {
    const validProjects = projects.filter(p => p.url.trim() !== "");
    if (validProjects.length === 0) return alert("Please enter a valid Project URL.");

    try {
      setLoading(true);
      setLoadingText("Checking Credits & Starting Review... 🚀");
      
      const projectsPayload = validProjects.map(p => ({
        title: p.title, repoUrl: p.url, attemptId: attemptIdFromUrl 
      }));
      
      const addRes = await axios.post(`${API_URL}/api/projects/add-multiple`, { projects: projectsPayload }, getAuthHeader());

      // Fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(e => console.log(e));

      const projectIds = addRes.data.projects?.map(proj => proj._id) || addRes.data.projectIds || [];
      if (projectIds.length > 0) {
        setSubmittedProjectId(projectIds[0]);
        projectIds.forEach(id => {
          axios.post(`${API_URL}/api/evaluation/evaluate`, { projectId: id }, getAuthHeader())
            .then(() => console.log(`✅ AI Eval running`)).catch(() => {});
        });
      }

      const aptRes = await axios.get(`${API_URL}/api/assessment/aptitude/${attemptIdFromUrl}`, getAuthHeader());
      setMcqData(aptRes.data.questions);
      setPhase("mcq");
      
    } catch (error) {
      if (error.response?.status === 402) setShowPaymentModal(true);
      else alert("Error starting test.");
    } finally {
      if(!showPaymentModal) setLoading(false);
    }
  };

  // ================= 🧠 PHASE 2: MCQ =================
  const checkAns = (qId, selectedAnsIndex) => setSelectedAnswers({ ...selectedAnswers, [qId]: selectedAnsIndex });
  const nextMCQ = () => {
    if (index === mcqData.length - 1) { submitAptitudePhase(); return; }
    setIndex(index + 1);
  };

  const submitAptitudePhase = async () => {
    try {
      setLoading(true);
      setLoadingText("Saving MCQs & Loading Coding... 💻");
      await axios.post(`${API_URL}/api/assessment/aptitude/submit/${attemptIdFromUrl}`, { answers: selectedAnswers }, getAuthHeader());
      const codeRes = await axios.get(`${API_URL}/api/assessment/coding/${attemptIdFromUrl}`, getAuthHeader());
      setCodingProblems(codeRes.data);
      setCodes(codeRes.data.map(q => q.defaultCode || "// Write code here...\n"));
      setPhase("coding");
    } catch (error) {
      alert("Aptitude Round Failed.");
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  // ================= 💻 PHASE 3: CODING =================
  const handleCodeChange = (e) => {
    const newCodes = [...codes];
    newCodes[codingIndex] = e.target.value;
    setCodes(newCodes);
  };
  const prevCodingProblem = () => { if (codingIndex > 0) setCodingIndex(codingIndex - 1); };
  const nextCodingProblem = () => {
    if (codingIndex === codingProblems.length - 1) submitCodingPhase();
    else setCodingIndex(codingIndex + 1);
  };

  const submitCodingPhase = async () => {
    try {
      setLoading(true);
      setLoadingText("Saving Coding Answers... 💾");
      const codingAnswers = codingProblems.map((prob, i) => ({ questionId: prob._id, code: codes[i] }));
      await axios.post(`${API_URL}/api/assessment/coding/submit/${attemptIdFromUrl}`, { codingAnswers }, getAuthHeader());
      
      setLoadingText("Finalizing Results... 🤖");
      const resultRes = await axios.get(`${API_URL}/api/assessment/result/${attemptIdFromUrl}`, getAuthHeader());

      // AI Score Polling
      let realProjectScore = 0, evalId = null, aiChecked = false, retries = 10;
      while (retries > 0 && !aiChecked) {
        try {
          const evalRes = await axios.get(`${API_URL}/api/evaluation/project/${submittedProjectId}`, getAuthHeader());
          if (evalRes.data) {
             evalId = evalRes.data._id || evalRes.data.evaluation?._id;
             realProjectScore = parseFloat(evalRes.data.finalScore || evalRes.data.evaluation?.finalScore || 0);
             if(evalId) aiChecked = true; else throw new Error();
          } else throw new Error();
        } catch (e) {
          await new Promise(res => setTimeout(res, 3000));
          retries--;
        }
      }

      const calculatedFinalScore = Math.round((realProjectScore * 0.35) + ((resultRes.data.aptitudeScore || 0) * 0.35) + ((resultRes.data.codingScore || 0) * 0.30));
      if (evalId) {
        await axios.post(`${API_URL}/api/dashboard/final-submit/${attemptIdFromUrl}`, {
          projectScore: realProjectScore, finalScore: calculatedFinalScore
        }, getAuthHeader());
      }
      setFinalResult({ ...resultRes.data, projectScore: realProjectScore, finalScore: calculatedFinalScore });
      setPhase("result");
    } catch (error) {
      alert("Submission failed.");
    } finally {
      setLoading(false);
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  };

  // ================= 🎨 UI RENDER =================
  if (!attemptIdFromUrl) return <div style={{textAlign: 'center', padding: '100px'}}>🚫 Invalid Link</div>;

  if (loading && !showPaymentModal) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8faff', fontFamily: 'Inter' }}>
      <div style={{ fontSize: '40px' }}>⚙️</div>
      <div style={{ color: '#553f9a', fontSize: '22px', fontWeight: 'bold' }}>{loadingText}</div>
    </div>
  );

  return (
    <>
      <style>{`
        .quiz-option { padding: 15px; border: 1.5px solid #ede8fb; border-radius: 10px; margin-bottom: 10px; cursor: pointer; background: #fff; }
        .quiz-option.selected { background: #553f9a; color: #fff; }
        .inp-field { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; margin-top: 5px; }
        .btn-primary { background: linear-gradient(135deg,#553f9a,#7b5fc4); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .no-select { user-select: none; }
        .warning-badge { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 8px; font-weight: bold; margin-bottom: 20px; border: 1px solid #fecaca; text-align: center; }
      `}</style>

      {/* 🚨 AI PROCTORING */}
      {(phase === "mcq" || phase === "coding") && !loading && (
        <Proctoring onCheatWarning={handleCheatWarning} maxWarnings={3} />
      )}

      {/* PAYMENT MODAL (Your logic kept intact) */}
      {showPaymentModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "15px", textAlign: "center", maxWidth: "450px" }}>
            <h2 style={{ color: "#dc2626" }}>Insufficient Credits! 🪙</h2>
            <p>10 credits required to start.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="btn-primary" onClick={() => handlePayment(99, 100)}>100 Credits (₹99)</button>
              <button className="btn-primary" onClick={() => handlePayment(199, 250)}>250 Credits (₹199)</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f8faff', display: 'flex', justifyContent: 'center' }}>
        <div 
          className={(phase === "mcq" || phase === "coding") ? "no-select" : ""}
          style={{ width: '100%', maxWidth: '800px', background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
          onCopy={handlePreventDefault} onPaste={handlePreventDefault} onContextMenu={handlePreventDefault}
        >
          {/* WARNING DISPLAY */}
          {proctorWarnings > 0 && <div className="warning-badge">⚠️ AI PROCTORING WARNING: {proctorWarnings} / 3</div>}

          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#2d1f6e', fontSize: '24px' }}>
              {phase === "projects" && "Step 1: Projects"}
              {phase === "mcq" && "Step 2: Aptitude"}
              {phase === "coding" && "Step 3: Coding"}
              {phase === "result" && "Results"}
            </h1>
            {(phase === "mcq" || phase === "coding") && (
              <div style={{ color: '#dc2626', fontWeight: 'bold' }}>⏱ {phase === "mcq" ? formatTime(timeLeft) : formatTime(codingTimeLeft)}</div>
            )}
          </div>
          <hr style={{ border: 'none', borderTop: '2px solid #ede8fb', marginBottom: '30px' }} />

          {/* RENDERING PHASES */}
          {phase === "projects" && (
            <div>
              {projects.map((proj, i) => (
                <div key={i} style={{ background: '#fcfbff', padding: '15px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #ede8fb' }}>
                  <input className="inp-field" placeholder="Title" value={proj.title} onChange={(e) => handleProjectChange(i, 'title', e.target.value)} />
                  <input className="inp-field" placeholder="GitHub URL" value={proj.url} onChange={(e) => handleProjectChange(i, 'url', e.target.value)} />
                </div>
              ))}
              <button onClick={addProject} style={{width: '100%', border: '1px dashed #553f9a', padding: '10px', background: 'none', color: '#553f9a', cursor: 'pointer', marginBottom: '20px'}}>+ Add More</button>
              <button onClick={startMCQPhase} className="btn-primary" style={{width: '100%'}}>Save & Start Test 🚀</button>
            </div>
          )}

          {phase === "mcq" && (
            <div>
              <h2 style={{ fontSize: '18px' }}>{index + 1}. {mcqData[index].questionText || mcqData[index].question}</h2>
              {mcqData[index].options.map((opt, i) => (
                <div key={i} onClick={() => checkAns(mcqData[index]._id, i)} className={`quiz-option ${selectedAnswers[mcqData[index]._id] === i ? 'selected' : ''}`}>{opt}</div>
              ))}
              <button onClick={nextMCQ} className="btn-primary" style={{marginTop: '20px', float: 'right'}}>Next →</button>
            </div>
          )}

          {phase === "coding" && (
            <div>
              <h3>{codingProblems[codingIndex].title}</h3>
              <p>{codingProblems[codingIndex].description || codingProblems[codingIndex].desc}</p>
              <textarea style={{ width: '100%', height: '250px', background: '#1e293b', color: '#fff', padding: '15px', borderRadius: '10px' }} value={codes[codingIndex]} onChange={handleCodeChange} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                 <button onClick={prevCodingProblem} className="btn-primary" style={{background: '#666'}}>Back</button>
                 <button onClick={nextCodingProblem} className="btn-primary">{codingIndex === codingProblems.length - 1 ? "Submit" : "Next"}</button>
              </div>
            </div>
          )}

          {phase === "result" && (
            <div style={{ textAlign: 'center' }}>
              <h2>Test Submitted! 🎓</h2>
              <div style={{ padding: '20px', background: '#f3f0ff', borderRadius: '10px', marginTop: '20px' }}>
                 <p>Projects: {finalResult.projectScore}%</p>
                 <p>Aptitude: {finalResult.aptitudeScore}%</p>
                 <p>Coding: {finalResult.codingScore}%</p>
                 <h3>Total: {finalResult.finalScore}%</h3>
              </div>
              <button onClick={() => navigate('/student')} className="btn-primary" style={{marginTop: '20px'}}>Back to Home</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Assessment;