const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); 

const {
  startTest, 
  getAptitudeQuestions,
  submitProjects,
  submitAptitude,
  getCodingQuestions,
  submitCoding,
  saveAssessmentProjects,
  getFinalResult
} = require("../controllers/assessmentController");

// 📝 TEST START
router.post("/start/:jobId", protect, startTest);

// ==========================================
// 🧠 APTITUDE ROUND (Dono raste khol diye!)
// ==========================================
router.get("/aptitude/:attemptId", protect, getAptitudeQuestions);
router.get("/:attemptId/aptitude", protect, getAptitudeQuestions);

router.post("/aptitude/submit/:attemptId", protect, submitAptitude);
router.post("/:attemptId/aptitude/submit", protect, submitAptitude);
router.post("/:attemptId/aptitude", protect, submitAptitude);

// ==========================================
// 💻 CODING ROUND (Dono raste khol diye!)
// ==========================================
router.get("/coding/:attemptId", protect, getCodingQuestions);
router.get("/:attemptId/coding", protect, getCodingQuestions);

router.post("/coding/submit/:attemptId", protect, submitCoding);
router.post("/:attemptId/coding/submit", protect, submitCoding);
router.post("/:attemptId/coding", protect, submitCoding);

// 📊 FINAL RESULT
router.get("/result/:attemptId", protect, getFinalResult);

module.exports = router;