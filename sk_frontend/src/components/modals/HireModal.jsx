import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "https://skilledlink-f4lp.onrender.com";

// 🟢 Preview environment ke liye DIFF yahan define kiya gaya hai
const DIFF = ["Easy", "Medium", "Hard"];

const HireModal = ({ onClose, onSuccess }) => {
  const [modalStep, setModalStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "", experience: "", salary: "", daysLeft: "", description: "", skills: [], languages: []
  });
  
  // Tagging inputs
  const [skillText, setSkillText] = useState("");
  const [langText, setLangText] = useState("");
  
  // 🚀 Start with 20, but HR can add more now!
  const [questions, setQuestions] = useState(
    Array(20).fill({ question: "", options: ["", "", "", ""], correct: 0 })
  );
  
  // 🚀 Start with 3, but HR can add more!
  const [coding, setCoding] = useState(
    Array(3).fill({ title: "", problem: "", input: "", output: "", hint: "" })
  );
  
  const [difficulty, setDifficulty] = useState(["Medium", "Medium", "Medium"]);

  const [formErrors, setFormErrors] = useState({});
  const [quizErrors, setQuizErrors] = useState({});

  const getToken = () => localStorage.getItem("token");

  // --- HANDLERS ---
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // TAGGING HANDLERS (Enter press karne par tags banane ke liye)
  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillText.trim() !== "") {
        setForm({ ...form, skills: [...form.skills, skillText.trim()] });
        setSkillText("");
      }
    }
  };

  const handleKeyDownLang = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (langText.trim() !== "") {
        setForm({ ...form, languages: [...form.languages, langText.trim()] });
        setLangText("");
      }
    }
  };

  const removeSkill = (indexToRemove) => {
    setForm({ ...form, skills: form.skills.filter((_, i) => i !== indexToRemove) });
  };

  const removeLang = (indexToRemove) => {
    setForm({ ...form, languages: form.languages.filter((_, i) => i !== indexToRemove) });
  };

  // QUIZ HANDLERS
  const handleQuizQuestionChange = (index, value) => {
    const newQ = [...questions];
    newQ[index] = { ...newQ[index], question: value };
    setQuestions(newQ);
  };

  const handleQuizOptionChange = (qIndex, optIndex, value) => {
    const newQ = [...questions];
    const newOptions = [...newQ[qIndex].options];
    newOptions[optIndex] = value;
    newQ[qIndex] = { ...newQ[qIndex], options: newOptions };
    setQuestions(newQ);
  };

  const handleQuizAnswerChange = (qIndex, optIndex) => {
    const newQ = [...questions];
    newQ[qIndex] = { ...newQ[qIndex], correct: optIndex };
    setQuestions(newQ);
  };

  // 🚀 ADD MORE QUIZ QUESTION
  const addMoreQuizQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: 0 }]);
  };

  // CODING HANDLERS
  const handleCodingChange = (index, field, value) => {
    const newC = [...coding];
    newC[index] = { ...newC[index], [field]: value };
    setCoding(newC);
  };

  const handleDifficultyChange = (index, value) => {
    const newD = [...difficulty];
    newD[index] = value;
    setDifficulty(newD);
  };

  // 🚀 ADD MORE CODING PROBLEM
  const addMoreCodingProblem = () => {
    setCoding([...coding, { title: "", problem: "", input: "", output: "", hint: "" }]);
    setDifficulty([...difficulty, "Medium"]);
  };

  // ✅ CREATE JOB API INTEGRATION
  const handlePost = async () => {
    try {
      setIsSubmitting(true);

      // 🟢 QUIZ FIX: Sirf bhare hue questions bhejein
      const validQuiz = questions
        .filter(q => q.question.trim() !== "")
        .map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correct 
        }));

      // 🟢 CODING FIX: 'problem' ko 'description' banayein
      const validCoding = coding
        .filter(c => c.title.trim() !== "" || c.problem.trim() !== "")
        .map((c, i) => ({
          title: c.title,
          description: c.problem, 
          difficulty: difficulty[i],
          sampleInput: c.input,
          sampleOutput: c.output,
          testCases: [{ input: c.input, expectedOutput: c.output }] 
        }));

      // 🟢 PAYLOAD
      const payload = {
        title: form.title,
        experience: form.experience,
        salary: form.salary,
        skills: form.skills,       
        languages: form.languages, 
        daysLeft: Number(form.daysLeft),
        description: form.description,
        quiz: validQuiz,      
        coding: validCoding   
      };

      const response = await axios.post(`${API_URL}/api/jobs/create`, payload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data) {
        alert("Job successfully posted! 🎉");
        if (onSuccess) onSuccess(); 
        onClose(); 
      }

    } catch (error) {
      console.error("Error creating job:", error);
      alert(error.response?.data?.message || error.response?.data?.error || "Something went wrong while posting the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>
              {modalStep === 1
                ? "Post a New Position"
                : modalStep === 2
                  ? "Build Question Bank"
                  : "Add Coding Round"}
            </h2>
            <div className="modal-steps">
              {[1, 2, 3].map((s, i) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className={`step-dot ${modalStep >= s ? "active" : ""}`}>{s}</span>
                  {i < 2 && <span className={`step-line ${modalStep > s ? "step-line-done" : ""}`} />}
                </span>
              ))}
              <div className="step-labels">
                {["Job Details", "Question Bank", "Coding Round"].map(l => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Step 1: Job Details */}
        {modalStep === 1 && (
          <>
            <p className="post-job-sub">Fill in the job details.</p>
            <div className="post-job-grid">
              <div className="post-field">
                <label>Job Title <span className="req">*</span></label>
                <input
                  name="title"
                  placeholder="e.g. Frontend Developer"
                  value={form.title}
                  onChange={handleFormChange}
                  className={formErrors.title ? "input-error" : ""}
                />
              </div>
              <div className="post-field">
                <label>Experience <span className="req">*</span></label>
                <input
                  name="experience"
                  placeholder="e.g. 0–2 Years"
                  value={form.experience}
                  onChange={handleFormChange}
                />
              </div>
              <div className="post-field">
                <label>Salary <span className="req">*</span></label>
                <input
                  name="salary"
                  placeholder="e.g. ₹4–₹6 LPA"
                  value={form.salary}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="post-field">
                <label>Skills <span className="req">*</span> <span className="hint">(Press Enter to add)</span></label>
                <input
                  name="skillsInput"
                  placeholder="e.g. React, Node.js"
                  value={skillText}
                  onChange={e => setSkillText(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                  {form.skills.map((s, i) => (
                    <span key={i} style={{ background: "#f3f0ff", color: "#553f9a", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center" }}>
                      {s} <button type="button" onClick={() => removeSkill(i)} style={{ background: "none", border: "none", color: "red", cursor: "pointer", marginLeft: "4px" }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="post-field">
                <label>Languages <span className="hint">(Press Enter to add)</span></label>
                <input
                  name="languagesInput"
                  placeholder="e.g. English, Hindi"
                  value={langText}
                  onChange={e => setLangText(e.target.value)}
                  onKeyDown={handleKeyDownLang}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                  {form.languages.map((l, i) => (
                    <span key={i} style={{ background: "#f3f0ff", color: "#553f9a", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "flex", alignItems: "center" }}>
                      {l} <button type="button" onClick={() => removeLang(i)} style={{ background: "none", border: "none", color: "red", cursor: "pointer", marginLeft: "4px" }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="post-field">
                <label>
                  Open for <span className="req">*</span>{" "}
                  <span className="hint">(days students can apply)</span>
                </label>
                <input
                  name="daysLeft"
                  type="number"
                  min="1"
                  placeholder="e.g. 14"
                  value={form.daysLeft}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <div className="post-field post-field-full">
              <label>Description <span className="req">*</span></label>
              <textarea
                name="description"
                placeholder="Describe the role..."
                value={form.description}
                onChange={handleFormChange}
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="post-btn" onClick={() => setModalStep(2)}>Next: Quiz Questions →</button>
            </div>
          </>
        )}

        {/* Step 2: Quiz Questions */}
        {modalStep === 2 && (
          <>
            <div style={{ background: "#f8faff", border: "1px solid #ede8fb", padding: "12px", borderRadius: "8px", marginBottom: "15px" }}>
              <p style={{ margin: 0, color: "#553f9a", fontSize: "14px", fontWeight: "bold" }}>
                🛡️ Smart Anti-Cheat System
              </p>
              <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "13px" }}>
                Add as many questions as you want. Our system will randomly select <strong>20 questions</strong> and shuffle the options for each candidate.
              </p>
            </div>
            
            <div className="quiz-questions-list" style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "10px" }}>
              {questions.map((q, qi) => (
                <div key={qi} className="quiz-q-card" id={`q${qi}`} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "15px" }}>
                  <div className="quiz-q-header">
                    <span className="quiz-q-number" style={{ fontWeight: "bold" }}>Question {qi + 1}</span>
                  </div>
                  <input
                    style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    className="quiz-q-input"
                    placeholder={`Type your question here...`}
                    value={q.question}
                    onChange={e => handleQuizQuestionChange(qi, e.target.value)}
                  />
                  <div className="quiz-options">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`quiz-option-row ${q.correct === oi ? "correct-option" : ""}`}
                        style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}
                      >
                        <input
                          type="radio"
                          name={`c-${qi}`}
                          checked={q.correct === oi}
                          onChange={() => handleQuizAnswerChange(qi, oi)}
                        />
                        <span className="option-letter" style={{ width: "20px", fontWeight: "bold" }}>{["A", "B", "C", "D"][oi]}</span>
                        <input
                          style={{ flex: 1, padding: "8px", border: q.correct === oi ? "1px solid #16a34a" : "1px solid #eee", borderRadius: "4px" }}
                          className="option-text-input"
                          placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                          value={opt}
                          onChange={e => handleQuizOptionChange(qi, oi, e.target.value)}
                        />
                        {q.correct === oi && <span className="correct-badge" style={{ color: "#16a34a", fontSize: "12px", fontWeight: "bold" }}>✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addMoreQuizQuestion} 
                style={{ width: "100%", padding: "12px", background: "#f3f0ff", color: "#553f9a", border: "1px dashed #553f9a", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
              >
                + Add Another Question to Bank
              </button>
            </div>
            <div className="modal-footer" style={{ marginTop: "20px" }}>
              <button className="cancel-btn" onClick={() => setModalStep(1)}>← Back</button>
              <button className="post-btn" onClick={() => setModalStep(3)}>Next: Coding Round →</button>
            </div>
          </>
        )}

        {/* Step 3: Coding Round */}
        {modalStep === 3 && (
          <>
            <p className="post-job-sub">Add coding problems for the technical round.</p>
            <div className="coding-questions-list" style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "10px" }}>
              {coding.map((c, ci) => (
                <div key={ci} className="coding-q-card" style={{ marginBottom: "20px", border: "1px solid #eee", padding: "15px", borderRadius: "8px", background: "#fafafa" }}>
                  <div className="coding-q-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span className="coding-q-number" style={{ fontWeight: "bold", color: "#2d1f6e" }}>Problem {ci + 1}</span>
                    <div className="difficulty-selector" style={{ display: "flex", gap: "5px" }}>
                      {(DIFF || ["Easy", "Medium", "Hard"]).map(d => (
                        <button
                          key={d}
                          type="button"
                          style={{
                            padding: "4px 10px", 
                            fontSize: "12px", 
                            cursor: "pointer",
                            background: difficulty[ci] === d ? "#553f9a" : "#fff",
                            color: difficulty[ci] === d ? "white" : "#666",
                            border: difficulty[ci] === d ? "none" : "1px solid #ddd",
                            borderRadius: "15px",
                            fontWeight: "bold"
                          }}
                          onClick={() => handleDifficultyChange(ci, d)}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="coding-field" style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Title <span className="req">*</span></label>
                    <input
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                      placeholder="e.g. Two Sum"
                      value={c.title}
                      onChange={e => handleCodingChange(ci, "title", e.target.value)}
                    />
                  </div>
                  <div className="coding-field" style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Problem Statement <span className="req">*</span></label>
                    <textarea
                      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                      placeholder="Describe the problem..."
                      value={c.problem}
                      rows={3}
                      onChange={e => handleCodingChange(ci, "problem", e.target.value)}
                    />
                  </div>
                  <div className="coding-io-grid" style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <div className="coding-field" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Test Case Input <span className="req">*</span></label>
                      <textarea
                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontFamily: "monospace" }}
                        placeholder="[2, 7, 11, 15], 9"
                        rows={2}
                        value={c.input}
                        onChange={e => handleCodingChange(ci, "input", e.target.value)}
                      />
                    </div>
                    <div className="coding-field" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Expected Output <span className="req">*</span></label>
                      <textarea
                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontFamily: "monospace" }}
                        placeholder="[0, 1]"
                        rows={2}
                        value={c.output}
                        onChange={e => handleCodingChange(ci, "output", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={addMoreCodingProblem} 
                style={{ width: "100%", padding: "12px", background: "#f3f0ff", color: "#553f9a", border: "1px dashed #553f9a", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
              >
                + Add Another Coding Problem
              </button>
            </div>
            
            <div className="modal-footer" style={{ marginTop: "20px" }}>
              <button className="cancel-btn" onClick={() => setModalStep(2)} disabled={isSubmitting}>← Back</button>
              <button 
                className="post-btn" 
                onClick={handlePost} 
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Posting Job..." : "🚀 Post Position"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HireModal;