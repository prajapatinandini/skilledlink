const express = require("express");
const router = express.Router();

const { getFinalScore } = require("../controllers/finalScoreController");

const {
  protect,
  studentOnly,
  companyOnly
} = require("../middleware/authMiddleware");



router.get(
  "/:attemptId",
  protect,
  getFinalScore
);

module.exports = router;