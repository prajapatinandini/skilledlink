const CompanyProfile = require("../models/CompanyProfile");
const TestAttempt = require("../models/TestAttempt");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const Test = require("../models/Test");
const CodingQuestion = require("../models/CodingQuestion"); // Naya import
const { VM } = require("vm2"); // Naya import coding test cases run karne ke liye

// ================= SABHI COMPANIES GET KAREIN =================
exports.getAllCompanies = async (req, res) => {
  try {
    // Real app mein CompanyProfile se fetch karte hain
    const companies = await CompanyProfile.find({ isActive: true }).select("companyName industry location logo");
    
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= TEST START KAREIN =================
exports.startTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // 1. Check if test exists
    let test = await Test.findOne({ company: testId });

    // 2. Auto-create if not found (with languages array fixed)
    if (!test) {
      test = await Test.create({
        company: testId,
        testName: "Standard Hiring Assessment",
        description: "Auto-generated assessment for testing",
        duration: 60,
        languages: ["JavaScript", "Python", "C++"], 
        passingMarks: 60
      });
    }

    const studentId = req.user ? req.user._id : null;
    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized. Student not logged in." });
    }

    // 3. 🚨 YAHAN DHYAN DEIN: "in-progress" small letters aur dash ke sath hai
    const newAttempt = await TestAttempt.create({
      student: studentId,
      company: testId,
      test: test._id,
      status: "in-progress" // Yahi galti baar-baar aa rahi thi
    });

    res.status(200).json({
      message: "Test started successfully",
      attemptId: newAttempt._id,
      testDetails: test
    });

  } catch (err) {
    console.error("Error in startTest:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= APTITUDE QUESTIONS GET KAREIN =================
exports.getAptitudeQuestions = async (req, res) => {
  try {
    // Test ke liye 5 random questions fetch karein
    const questions = await AptitudeQuestion.aggregate([
      { $sample: { size: 5 } },
      { $project: { correctAnswer: 0 } } // Frontend par answers nahi bhej rahe!
    ]);

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= APTITUDE SUBMIT KAREIN =================
exports.submitAptitude = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // { questionId: selectedOptionIndex }

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt nahi mila" });

    let score = 0;
    
    // Answers evaluate karein
    for (const [qId, selectedOpt] of Object.entries(answers)) {
      const question = await AptitudeQuestion.findById(qId);
      if (question && question.correctAnswer === selectedOpt) {
        score += 1; // Ya question.marks
      }
    }

    const percentage = (score / Object.keys(answers).length) * 100;

    // Attempt mein save karein
    attempt.aptitudeScore = percentage;
    attempt.aptitudeCleared = percentage >= 40; // 40% passing criteria
    await attempt.save();

    res.json({ 
      message: "Aptitude submit ho gaya", 
      score: percentage, 
      passed: attempt.aptitudeCleared 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CODING QUESTIONS GET KAREIN =================
exports.getCodingQuestions = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      student: req.user._id
    }).populate("test");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt nahi mila" });
    }

    // Agar test pehle hi complete ho chuka hai
    if (attempt.status === "completed") {
      return res.status(400).json({ message: "Test pehle hi complete ho chuka hai" });
    }

    // Agar aptitude clear nahi hua hai
    if (!attempt.aptitudeCleared) {
      return res.status(403).json({ message: "Pehle aptitude clear karein" });
    }

    // Agar coding pehle hi submit ho chuki hai
    if (attempt.codingAnswers && attempt.codingAnswers.length > 0) {
      return res.status(400).json({ message: "Coding pehle hi submit ho chuki hai" });
    }

    // Coding questions get karein
    const questions = await CodingQuestion.find({
      test: attempt.test ? attempt.test._id : null
    })
      .limit(attempt.test && attempt.test.codingCount ? attempt.test.codingCount : 1)
      .select("-testCases");

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CODING SUBMIT KAREIN =================
exports.submitCoding = async (req, res) => {
  try {
    const { codingAnswers } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      student: req.user._id
    }).populate("test");

    if (!attempt)
      return res.status(404).json({ message: "Attempt nahi mila" });

    if (!attempt.aptitudeCleared)
      return res.status(403).json({ message: "Pehle aptitude clear karein" });

    let obtainedMarks = 0;
    let totalMarks = 0;
    const processedCoding = [];

    for (let ans of codingAnswers) {
      const question = await CodingQuestion.findById(ans.questionId);
      if (!question) continue;

      totalMarks += question.marks;
      let passed = 0;

      if (question.testCases && question.testCases.length > 0) {
        const vm = new VM({ timeout: 1000, sandbox: {} });

        for (let t of question.testCases) {
          try {
            const inputArgs = t.input.split(/[ ,]+/).map(v => isNaN(v) ? v : Number(v));
            const wrappedCode = `${ans.code}\nsolution(${inputArgs.map(v => JSON.stringify(v)).join(",")});`;
            const result = vm.run(wrappedCode);
            if (Number(result) === Number(t.expectedOutput)) passed++;
          } catch (err) {}
        }
      } else passed = 1;

      const marks = question.testCases && question.testCases.length > 0
        ? Math.floor((passed / question.testCases.length) * question.marks)
        : question.marks;

      obtainedMarks += marks;

      processedCoding.push({
        questionId: question._id,
        code: ans.code,
        testCasesPassed: passed,
        totalTestCases: question.testCases ? question.testCases.length : 0,
        marksAwarded: marks
      });
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const passingMarks = (attempt.test && attempt.test.passingMarks) ? attempt.test.passingMarks : 40;
    const result = percentage >= passingMarks ? "pass" : "fail";

    // Coding-specific fields update karein
    attempt.codingAnswers = processedCoding;
    attempt.codingObtainedMarks = obtainedMarks;
    attempt.codingTotalMarks = totalMarks;
    attempt.codingPercentage = percentage;
    attempt.result = result;
    attempt.status = "completed";

    await attempt.save();

    res.json({
      message: "Test Complete ho gaya",
      codingMarks: obtainedMarks,
      codingTotal: totalMarks,
      codingPercentage: percentage,
      result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= FINAL RESULT GET KAREIN =================
exports.getFinalResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findById(attemptId).populate("company student");

    if (!attempt) return res.status(404).json({ message: "Attempt nahi mila" });

    // Final score calculate karein frontend logic ke basis par (Projects 35%, Aptitude 35%, Coding 30%)
    const finalScore = Math.round(
      ((attempt.projectScore || 0) * 0.35) + 
      ((attempt.aptitudeScore || 0) * 0.35) + 
      ((attempt.codingPercentage || 0) * 0.30)
    );

    res.json({
      studentName: attempt.student.name,
      companyName: attempt.company.companyName,
      projectScore: attempt.projectScore || 0,
      aptitudeScore: attempt.aptitudeScore || 0,
      codingScore: attempt.codingPercentage || 0,
      finalScore: finalScore,
      status: attempt.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};