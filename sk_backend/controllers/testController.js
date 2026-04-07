// controllers/testController.js

const Test = require("../models/Test");
const mongoose = require("mongoose");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const CodingQuestion = require("../models/CodingQuestion");

// ================= CREATE TEST =================
exports.createTest = async (req, res) => {
  try {
    const {
      testName,
      description,
      duration,
      languages,
      passingMarks,
      deadline
    } = req.body;

    const test = await Test.create({
      company: req.user._id, // from protect middleware
      testName,
      description,
      duration,
      languages,
      passingMarks,
      deadline
    });

    res.status(201).json({
      message: "Test created successfully",
      test
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= START TEST =================
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