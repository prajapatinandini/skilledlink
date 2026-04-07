const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { startTest } = require("../controllers/testController");

router.get("/start/:testId", protect, startTest);

module.exports = router;