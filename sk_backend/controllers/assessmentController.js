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

    // 🚀 ANTI-CHEAT LOGIC START 🚀

    // 1. Saare questions ko randomly mix (shuffle) kar do
    const shuffledQuizBank = job.quiz.sort(() => Math.random() - 0.5);

    // 2. Unme se sirf 20 questions uthao (agar 20 se kam hain toh saare utha lega)
    const MAX_QUESTIONS = 20;
    const selectedQuestions = shuffledQuizBank.slice(0, MAX_QUESTIONS);

    // 3. Ab har question ke 'options' ko bhi mix (shuffle) kar do
    const questions = selectedQuestions.map(q => {
      // Options ki copy banayi aur shuffle kiya
      let shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

      return {
        _id: q._id,
        question: q.question,
        options: shuffledOptions,
        marks: q.marks || 1
      };
    });

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
    
    const processedAnswers = []; 
    
    for (const [qId, selectedOpt] of Object.entries(answers)) {
      const question = job.quiz.find(q => q._id.toString() === qId);
      
      if (question) {
        const isCorrect = (question.correctAnswer == selectedOpt);
        
        if (isCorrect) {
          score += (question.marks || 1); 
        }

        let correctIdx = question.options.findIndex(opt => opt == question.correctAnswer);
        let chosenIdx = question.options.findIndex(opt => opt == selectedOpt);

        if (correctIdx === -1 && !isNaN(question.correctAnswer)) correctIdx = Number(question.correctAnswer);
        if (chosenIdx === -1 && !isNaN(selectedOpt)) chosenIdx = Number(selectedOpt);

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

    // 🚀 FIX: Calculate percentage based on 20 questions (or total if less than 20)
    const MAX_QUESTIONS = 20;
    const totalQuestionsAsked = Math.min(MAX_QUESTIONS, job.quiz.length);
    
    // Total marks assumes 1 mark per question. If varying, you'd calculate dynamically.
    const percentage = totalQuestionsAsked > 0 ? (score / totalQuestionsAsked) * 100 : 0;

    attempt.aptitudeScore = percentage;
    attempt.aptitudeCleared = percentage >= 40; 
    
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

    // 🚀 SMART CODING RANDOMIZATION: Bucketing by Difficulty
    let hard = job.coding.filter(c => c.difficulty === 'Hard').sort(() => Math.random() - 0.5);
    let medium = job.coding.filter(c => c.difficulty === 'Medium').sort(() => Math.random() - 0.5);
    let easy = job.coding.filter(c => c.difficulty === 'Easy').sort(() => Math.random() - 0.5);

    let selectedQuestions = [];

    // 1. Ek-ek question teeno category se uthao
    if (hard.length) selectedQuestions.push(hard.pop());
    if (medium.length) selectedQuestions.push(medium.pop());
    if (easy.length) selectedQuestions.push(easy.pop());

    // 2. Agar koi category khali thi aur abhi 3 questions pure nahi hue hain
    // Toh baaki bache hue questions mein se random utha kar fill kar do (Fallback Logic)
    const remainingQuestions = [...medium, ...easy, ...hard].sort(() => Math.random() - 0.5);
    
    while (selectedQuestions.length < 3 && remainingQuestions.length > 0) {
      selectedQuestions.push(remainingQuestions.shift());
    }

    // Frontend ko bhejne ke liye format karo (Test cases mat bhejna yahan!)
    const formattedData = selectedQuestions.map(c => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      sampleInput: c.sampleInput,
      sampleOutput: c.sampleOutput,
      difficulty: c.difficulty,
      defaultCode: `function solution(input) {\n  // Write your code here\n  \n}`
    }));

    res.json(formattedData);
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
    
    // 🚀 FIX 1: Prevent crash if Job is missing
    if (!job) return res.status(404).json({ message: "Job not found in database" });

    let obtainedMarks = 0;
    let totalMarks = 0; 
    const processedCoding = [];
    let globalDebugLogs = []; 

    // 🚀 FIX 2: Safe array check to prevent loop crashes
    if (!codingAnswers || !Array.isArray(codingAnswers) || codingAnswers.length === 0) {
        return res.json({ message: "codingAnswers is missing or empty!" });
    }

    for (let ans of codingAnswers) {
      const question = job.coding.find(q => q._id.toString() === ans.questionId);
      if (!question) {
          globalDebugLogs.push(`Question ID ${ans.questionId} not found in database!`);
          continue;
      }

      const qMarks = question.marks || 10;
      
      // 🚀 FIX 3: Sirf unhi questions ke marks jodo jo student ko assign hue the
      totalMarks += qMarks; 

      let passed = 0;
      let questionLogs = [];

      if (question.testCases && question.testCases.length > 0) {
        for (let t of question.testCases) {
          // Note: Ensure you have run `npm install vm2` and required it at the top!
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

    // Safe percentage calculation
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
    const jobId = attempt.company; // 👈 Attempt se Job ID nikal li

    if (projects && projects.length > 0) {
      for (let p of projects) {
        if (p.url && p.url.trim() !== "") {
          
          // 🚀 FIND: User + Job + URL teeno match karne chahiye
          let existingProj = await Project.findOne({ 
             userId: attempt.student, 
             jobId: jobId, 
             repoUrl: p.url 
          });
          
          if (existingProj) {
            projectIds.push(existingProj._id);
          } else {
            // 🚀 CREATE: Naya project banate waqt jobId bhi save karo
            const newProj = await Project.create({
              userId: attempt.student,
              jobId: jobId, 
              title: p.title || "Assessment Project",
              repoUrl: p.url, 
            });
            projectIds.push(newProj._id);
          }
        }
      }
    }

    res.json({ message: "Projects saved successfully", projectIds });
  } catch (err) {
    console.error("Project Submit Error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.saveAssessmentProjects = async (req, res) => {
  try {
    const { projects } = req.body;
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!userId) return res.status(401).json({ message: "Auth Failed" });
    if (!projects || !projects.length) return res.status(400).json({ message: "No data" });

    // 1. Get the Job ID from the TestAttempt
    const attemptId = projects[0].attemptId;
    const attempt = await TestAttempt.findById(attemptId);
    
    if (!attempt) return res.status(404).json({ message: "Attempt Not Found" });
    const jobId = attempt.company; 

    const projectIds = [];

    for (let p of projects) {
      const repoUrl = p.repoUrl || p.url;
      if (repoUrl) {
        // 2. Simple Find or Create
        let project = await Project.findOne({ repoUrl, userId, jobId });
        
        if (!project) {
          project = await Project.create({
            userId,
            jobId, // This fixes the "jobId is required" error
            title: p.title || "Assessment Project",
            repoUrl
          });
        }
        projectIds.push(project._id);
      }
    }
    res.status(200).json({ message: "Success", projectIds });
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};