const express = require("express");
const router = express.Router();

const { protect, companyOnly } = require("../middleware/authMiddleware");

const {
  addAptitudeQuestion,
  addCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
  updateCodingQuestion,
  deleteCodingQuestion,
  getCompanyQuestions
} = require("../controllers/questionController");


/* =====================================
   📘 APTITUDE QUESTIONS
===================================== */

// Add aptitude question
router.post(
  "/aptitude/:testId",
  protect,
  companyOnly,
  addAptitudeQuestion
);


/* =====================================
   💻 CODING QUESTIONS
===================================== */

// Add coding question
router.post(
  "/coding/:testId",
  protect,
  companyOnly,
  addCodingQuestion
);

// Get all coding questions of a test
router.get(
  "/coding/test/:testId",
  protect,
  companyOnly,
  getCodingQuestions
);

// Get single coding question
router.get(
  "/coding/:questionId",
  protect,
  companyOnly,
  getCodingQuestion
);

// Update coding question
router.put(
  "/coding/:questionId",
  protect,
  companyOnly,
  updateCodingQuestion
);

// Delete coding question
router.delete(
  "/coding/:questionId",
  protect,
  companyOnly,
  deleteCodingQuestion
);

router.get("/company/questions", protect, companyOnly, getCompanyQuestions);

module.exports = router;