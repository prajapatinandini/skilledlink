const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const User = require("../models/User"); // 👈 1. NEW: User model import karna zaroori hai!

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/reset-password", authController.resetPassword);

// Yeh dekhiye aapne yahan 'protect' use kiya hai
router.get("/me", protect, authController.getMe);

// 👈 2. FIX: 'authMiddleware' ki jagah 'protect' likha hai
router.get("/user-credits", protect, async (req, res) => {
  try {
    // req.user.id ya req.user._id (MongoDB mein mostly _id hota hai)
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("credits"); 
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ credits: user.credits });
  } catch (err) {
    console.error("Credits Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;