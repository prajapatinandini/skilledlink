const express = require("express");
const router = express.Router();
const { getAllCompanies, addCredits } = require("../controllers/adminController");

// TODO: In routes par apna Auth middleware laga dena baad me (e.g., router.get('/companies', protect, isAdmin, getAllCompanies))
router.get("/companies", getAllCompanies);
router.post("/add-credits", addCredits);

module.exports = router;