// routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Middleware
const { protect, studentOnly } = require("../middleware/authMiddleware");

// Controller
const { getAllCompanies } = require("../controllers/studentController");

// 👇 YAHAN PE ADD KIYA HAI (Yeh line batayegi undefined kya hai) 👇
console.log("🕵️ CHECK IMPORTS ->", { 
  protectFunction: typeof protect, 
  studentOnlyFunction: typeof studentOnly, 
  getAllCompaniesFunction: typeof getAllCompanies 
});

// Route
router.get("/companies", protect, studentOnly, getAllCompanies);

module.exports = router;