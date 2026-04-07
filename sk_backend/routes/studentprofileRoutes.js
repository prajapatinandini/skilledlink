const express = require("express");
const router = express.Router();

const {
  completeProfile,
  getProfile,
  updateProfile
} = require("../controllers/studentprofileController");

const {protect} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


router.post(
  "/complete", 
  protect, 
  upload.fields([{ name: "resume", maxCount: 1 }, { name: "profilePhoto", maxCount: 1 }]), 
  completeProfile
);

router.get("/me", protect, getProfile);

// Update route me bhi dono files handle karne ka logic laga diya gaya hai
router.put(
  "/update", 
  protect, 
  upload.fields([{ name: "resume", maxCount: 1 }, { name: "profilePhoto", maxCount: 1 }]), 
  updateProfile
);

module.exports = router;