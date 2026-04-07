const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController"); 
const { protect, companyOnly } = require("../middleware/authMiddleware");
const { createTest } = require("../controllers/testController");




router.get("/profile", protect, companyOnly, companyController.getProfile);


// Create company profile
router.post(
  "/create-profile",
  protect,
  companyOnly,
  companyController.createCompanyProfile
);


// Update company profile
router.put(
  "/profile",
  protect,
  companyOnly,
  companyController.updateProfile
);

// Dashboard
router.get(
  "/dashboard",
  protect,
  companyOnly,
  (req, res) => {
    res.json({ message: "Welcome Company Dashboard" });
  }
);

// Tests
router.get(
  "/tests",
  protect,
  companyOnly,
  companyController.getCompanyTests
);

router.get(
  "/tests/:testId/stats",
  protect,
  companyOnly,
  companyController.getTestStats
);

// Students
router.get(
  "/students/:testId",
  protect,
  companyOnly,
  companyController.getStudentsByTest
);

router.get(
  "/student/:studentId",
  protect,
  companyOnly,
  companyController.getStudentDetails
);

// Create test
router.post(
  "/create-test",
  protect,
  companyOnly,
  createTest
);



module.exports = router;