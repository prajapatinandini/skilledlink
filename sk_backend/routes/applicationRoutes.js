const express = require("express");
const router = express.Router();
const { protect, studentOnly } = require("../middleware/authMiddleware");
const applicationController = require("../controllers/applicationController");

router.post(
  "/submit-github",
  protect,
  studentOnly,
  applicationController.submitGithubProject
);

router.get("/talent-pool", protect, applicationController.getTalentPool);
router.get("/analytics", protect, applicationController.getAnalytics);
router.get("/dashboard", protect, applicationController.getDashboardData);

router.patch("/:id/status", protect, applicationController.updateApplicationStatus);

module.exports = router;