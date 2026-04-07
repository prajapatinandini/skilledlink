const express = require("express");
const router = express.Router();

// 🔴 Aapka middleware path check kar lena
const { protect, companyOnly } = require("../middleware/authMiddleware"); 

const {
  getDashboardData,
  getAnalyticsData,
  getPlacementsData,
  getTalentPoolData,
  getJobAttempts,
  finalizeAssessment,
  getApplicantProjects,
  updateAttemptStatus,
  getStudentPortfolio // 🟢 YAHAN IMPORT ADD KIYA HAI
} = require("../controllers/dashboardController");

// Dashboard & Analytics
router.get("/", protect, companyOnly, getDashboardData);
router.get("/analytics", protect, companyOnly, getAnalyticsData);
router.get("/placements", protect, companyOnly, getPlacementsData);
router.get("/talent-pool", protect, companyOnly, getTalentPoolData);

// Job Attempts
router.get("/attempts/:jobId", protect, companyOnly, getJobAttempts);

// Update Status (Hire/Reject)
router.patch("/attempt/:attemptId/status", protect, companyOnly, updateAttemptStatus);

// Submissions & Projects
router.post('/final-submit/:attemptId', protect, finalizeAssessment);
router.get("/projects/:attemptId", protect, companyOnly, getApplicantProjects);

// 🟢 YEH RAHA WO ROUTE JISKI WAJAH SE PORTFOLIO MEIN 404 AA RAHA THA!
router.get("/portfolio/:id", protect, companyOnly, getStudentPortfolio);

module.exports = router;