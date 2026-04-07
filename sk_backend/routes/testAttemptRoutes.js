const express = require("express");
const router = express.Router();

// Auth middleware import karein (path apne according adjust kar lena)
const { protect } = require("../middleware/authMiddleware");

// Apne controller ko import karein (maan lijiye file ka naam assessmentController.js hai)
const {
  getAllCompanies,
  startTest,
  getAptitudeQuestions,
  submitAptitude,
  getCodingQuestions,
  submitCoding,
  getFinalResult
} = require("../controllers/assessmentController");

// ==========================================
// 🏢 COMPANY ROUTES
// ==========================================
// Get all companies for the dashboard
router.get("/companies", protect, getAllCompanies);

// ==========================================
// 📝 TEST START ROUTE
// ==========================================
// Start a test for a specific company
router.post("/start/:companyId", protect, startTest);

// ==========================================
// 🧠 APTITUDE ROUND ROUTES
// ==========================================
// Get random aptitude questions
router.get("/aptitude/:attemptId", protect, getAptitudeQuestions);

// Submit aptitude answers
router.post("/aptitude/submit/:attemptId", protect, submitAptitude);

// ==========================================
// 💻 CODING ROUND ROUTES
// ==========================================
// Get coding questions (only if aptitude is cleared)
router.get("/coding/:attemptId", protect, getCodingQuestions);

// Submit coding answers and evaluate via VM2
router.post("/coding/submit/:attemptId", protect, submitCoding);

// ==========================================
// 📊 FINAL RESULT ROUTE
// ==========================================
// Get the final calculated result of the attempt
router.get("/result/:attemptId", protect, getFinalResult);

module.exports = router;