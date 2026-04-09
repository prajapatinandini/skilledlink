const Job = require("../models/Job");
const TestAttempt = require("../models/TestAttempt");
const User = require("../models/User"); 
const Project = require("../models/Project");
const { VM } = require("vm2"); 

exports.startTest = async (req, res) => {
  try {
    const { jobId } = req.params; 
    
    // Extract Student ID safely
    const studentId = req.user ? (req.user._id || req.user.id) : null;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized. Student not logged in." });
    }

    // 1. Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // 🚀 THE SECURITY FIX: Block if Job is Paused or Expired 🚀
    // Hum check kar rahe hain: Paused hai? YA Days khatam ho gaye?
    if (job.isPaused || job.daysLeft <= 0) {
      return res.status(403).json({ 
        message: job.isPaused 
          ? "This job is currently paused by the HR. Please check back later." 
          : "This job application has expired. You can no longer start this test." 
      });
    }

    // 2. Check if attempt already exists for this specific job & student
    let attempt = await TestAttempt.findOne({ student: studentId, company: jobId });

    // 🟢 SCENARIO A: ATTEMPT ALREADY EXISTS 🟢
    if (attempt) {
      if (attempt.status === "completed") {
        return res.status(400).json({ 
          message: "You have already completed the assessment for this role. Retakes are not allowed." 
        });
      }
      
      // Resume logic
      return res.status(200).json({
        message: "Resuming existing assessment. No credits deducted.",
        attemptId: attempt._id,
        jobDetails: {
          title: job.title,
          hasAptitude: job.quiz && job.quiz.length > 0,
          hasCoding: job.coding && job.coding.length > 0
        }
      });
    }

    // 🟢 SCENARIO B: FRESH APPLY (FIRST TIME) 🟢
    const student = await User.findById(studentId);
    
    // Check wallet balance
    if (student.credits < 10) {
       return res.status(402).json({ 
           message: "Insufficient credits to apply. Please recharge.", 
           requiresRecharge: true,
           currentCredits: student.credits
       });
    }

    // Deduct exactly 10 credits
    student.credits -= 10;
    await student.save();

    // Create new attempt tracking
    attempt = await TestAttempt.create({
      student: studentId,
      company: jobId, 
      status: "in-progress"
    });

    // Send Success response
    res.status(200).json({
      message: "Test started successfully. 10 Credits deducted. 🪙",
      attemptId: attempt._id,
      jobDetails: {
        title: job.title,
        hasAptitude: job.quiz && job.quiz.length > 0,
        hasCoding: job.coding && job.coding.length > 0
      }
    });

  } catch (err) {
    console.error("Error in startTest:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= APTITUDE QUESTIONS GET =================
exports.getAptitudeQuestions = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const job = await Job.findById(attempt.company);
    if (!job || !job.quiz || job.quiz.length === 0) {
      return res.status(404).json({ message: "No aptitude questions found for this job" });
    }

    const questions = job.quiz.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      marks: q.marks || 1
    }));

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= APTITUDE SUBMIT =================
exports.submitAptitude = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; 

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const job = await Job.findById(attempt.company);
    let score = 0;
    
    // 🟢 NAYA CODE: Answers ko database mein save karne ke liye array banaya
    const processedAnswers = []; 
    
    for (const [qId, selectedOpt] of Object.entries(answers)) {
      const question = job.quiz.find(q => q._id.toString() === qId);
      
      if (question) {
        const isCorrect = (question.correctAnswer == selectedOpt);
        
        if (isCorrect) {
          score += (question.marks || 1); 
        }

        // Frontend ko jo index chahiye (correct aur chosen answer ka), wo nikal rahe hain
        let correctIdx = question.options.findIndex(opt => opt == question.correctAnswer);
        let chosenIdx = question.options.findIndex(opt => opt == selectedOpt);

        // Fallback incase index directly answer me passed hai
        if (correctIdx === -1 && !isNaN(question.correctAnswer)) correctIdx = Number(question.correctAnswer);
        if (chosenIdx === -1 && !isNaN(selectedOpt)) chosenIdx = Number(selectedOpt);

        // Array me push kar rahe hain
        processedAnswers.push({
          questionId: qId,
          questionText: question.question || "Question text missing",
          options: question.options || [],
          correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
          chosenAnswerIndex: chosenIdx !== -1 ? chosenIdx : 0,
          isCorrect: isCorrect
        });
      }
    }

    const totalQuestions = job.quiz.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    attempt.aptitudeScore = percentage;
    attempt.aptitudeCleared = percentage >= 40; 
    
    // 🟢 NAYA CODE: Yahan attempt document mein array save ho raha hai!
    attempt.aptitudeAnswers = processedAnswers; 
    
    await attempt.save();

    res.json({ message: "Aptitude submitted", score: percentage, passed: attempt.aptitudeCleared });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CODING QUESTIONS GET =================
exports.getCodingQuestions = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const job = await Job.findById(attempt.company);
    if (!job || !job.coding || job.coding.length === 0) {
      return res.status(404).json({ message: "No coding questions found" });
    }

    const questions = job.coding.map(c => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      sampleInput: c.sampleInput,
      sampleOutput: c.sampleOutput,
      defaultCode: `function solution(input) {\n  // Write your code here\n  \n}`
    }));

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CODING SUBMIT =================
exports.submitCoding = async (req, res) => {
  try {
    const { codingAnswers } = req.body; 
    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    
    const job = await Job.findById(attempt.company);

    let obtainedMarks = 0;
    let totalMarks = 0;
    const processedCoding = [];
    let globalDebugLogs = []; 

    if (job.coding && job.coding.length > 0) {
      job.coding.forEach(q => { totalMarks += (q.marks || 10); });
    }

    if (!codingAnswers || codingAnswers.length === 0) {
        return res.json({ message: "codingAnswers is missing or empty!" });
    }

    for (let ans of codingAnswers) {
      const question = job.coding.find(q => q._id.toString() === ans.questionId);
      if (!question) {
          globalDebugLogs.push(`Question ID ${ans.questionId} not found in database!`);
          continue;
      }

      const qMarks = question.marks || 10;
      let passed = 0;
      let questionLogs = [];

      if (question.testCases && question.testCases.length > 0) {
        for (let t of question.testCases) {
          const vm = new VM({ timeout: 1500, sandbox: {} });

          try {
            let cleanInput = t.input ? String(t.input) : "";
            cleanInput = cleanInput.replace(/[a-zA-Z]+\s*=\s*/g, '');
            cleanInput = cleanInput.replace(/\n/g, ',');

            const wrappedCode = `${ans.code}\nsolution(${cleanInput});`;
            questionLogs.push(`Code Running: solution(${cleanInput});`); 

            const result = vm.run(wrappedCode);

            const actualOutput = result !== undefined ? JSON.stringify(result).replace(/\s/g, '') : "undefined";
            const expectedOutput = String(t.expectedOutput).replace(/\s/g, '');

            if (actualOutput === expectedOutput) {
              passed++;
              questionLogs.push(`✅ Passed`);
            } else {
              questionLogs.push(`❌ Failed: Expected ${expectedOutput}, Got ${actualOutput}`);
            }
          } catch (err) {
            questionLogs.push(`⚠️ VM Error: ${err.message}`);
          }
        }
      } else { 
        questionLogs.push(`⚠️ No test cases found for this question.`);
      }

      const marks = question.testCases && question.testCases.length > 0
        ? Math.floor((passed / question.testCases.length) * qMarks)
        : 0;

      obtainedMarks += marks;
      globalDebugLogs.push({ questionId: question._id, logs: questionLogs });

      processedCoding.push({
        questionId: question._id,
        code: ans.code,
        testCasesPassed: passed,
        totalTestCases: question.testCases ? question.testCases.length : 0,
        marksAwarded: marks
      });
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    
    attempt.codingAnswers = processedCoding;
    attempt.codingObtainedMarks = obtainedMarks;
    attempt.codingTotalMarks = totalMarks;
    attempt.codingPercentage = percentage;
    attempt.result = percentage >= 40 ? "pass" : "fail";
    attempt.status = "completed";
    
    await attempt.save();

    res.json({ 
      message: "Test Complete", 
      codingMarks: obtainedMarks, 
      codingPercentage: percentage, 
      result: attempt.result,
      DEBUG_LOGS: globalDebugLogs 
    });

  } catch (err) {
    console.error("Submit Coding Route Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= FINAL RESULT GET =================
exports.getFinalResult = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId).populate("student");
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    const job = await Job.findById(attempt.company);

    const finalScore = Math.round(((attempt.aptitudeScore || 0) * 0.50) + ((attempt.codingPercentage || 0) * 0.50));

    res.json({
      studentName: attempt.student?.name || "Unknown",
      jobTitle: job?.title || "Unknown Role",
      aptitudeScore: attempt.aptitudeScore || 0,
      codingScore: attempt.codingPercentage || 0,
      finalScore: finalScore,
      status: attempt.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= SUBMIT PROJECTS =================
exports.submitProjects = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const { projects } = req.body; 
    const projectIds = [];

    if (projects && projects.length > 0) {
      for (let p of projects) {
        if (p.url && p.url.trim() !== "") {
          const newProj = await Project.create({
            userId: attempt.student, 
            title: p.title || "Assessment Project",
            repoUrl: p.url, 
          });
          projectIds.push(newProj._id);
        }
      }
    }

    res.json({ message: "Projects saved successfully", projectIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= SAVE PROJECTS FROM ASSESSMENT =================
exports.saveAssessmentProjects = async (req, res) => {
  try {
    const { projects } = req.body;
    const userId = req.user.id || req.user._id; 
    const projectIds = [];

    if (projects && projects.length > 0) {
      for (let p of projects) {
        if (p.url && p.url.trim() !== "") {
          let existingProj = await Project.findOne({ repoUrl: p.url, userId: userId });
          
          if (!existingProj) {
            existingProj = await Project.create({
              userId: userId,
              title: p.title || "Assessment Project",
              repoUrl: p.url,
            });
          }
          
          projectIds.push(existingProj._id);
        }
      }
    }

    res.status(200).json({ message: "Projects saved", projectIds });
  } catch (error) {
    console.error("Save Project Error:", error);
    res.status(500).json({ message: "Error saving projects", error: error.message });
  }
};