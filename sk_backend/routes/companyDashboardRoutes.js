const express = require("express");
const router = express.Router();

const { protect, companyOnly } = require("../middleware/authMiddleware");

const {
  getTestDetails,
  getTestAttempts,
  getAttemptDetail,
  getTestStats,
  getDetailedStats,
  getChartStats
} = require("../controllers/companyDashboardController");


// ✅ Test Info
router.get("/tests/:testId", protect, companyOnly, getTestDetails);

// ✅ Attempts
router.get("/attempts/:testId", protect, companyOnly, getTestAttempts);
router.get("/attempt/:attemptId", protect, companyOnly, getAttemptDetail);

// ✅ Stats
router.get("/stats/:testId", protect, companyOnly, getTestStats);
router.get("/stats/:testId/detailed", protect, companyOnly, getDetailedStats);
router.get("/stats/:testId/chart", protect, companyOnly, getChartStats);

module.exports = router;