

const User = require("../models/User");
const Otp = require("../models/Otp"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail"); 
const CompanyProfile = require("../models/CompanyProfile");



// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) return res.status(403).json({ message: "Verify OTP first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🚀 DYNAMIC PROFILE CHECK
    let isProfileComplete = false;

    if (user.role === "company") {
      // 🕵️‍♂️ Check: Kya is owner ke naam pe koi profile document bana hai?
      const profile = await CompanyProfile.findOne({ owner: user._id });
      
      if (profile) {
        // Agar profile mil gayi, toh check karo ki location aur industry bhari hai ya nahi
        // Kyunki registration ke waqt hum sirf name aur size lete hain
        isProfileComplete = !!(profile.location && profile.industry);
      } else {
        // Agar CompanyProfile collection mein is user ki entry hi nahi hai
        isProfileComplete = false;
      }
    } 
    else if (user.role === "student") {
      // Student logic (Yahan aap StudentProfile model use kar sakte hain)
      isProfileComplete = !!(user.skills && user.skills.length > 0);
    }

    res.json({
      message: "Login success",
      token,
      role: user.role,
      isProfileComplete, // Frontend ab isi true/false ke basis par redirect karega
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ===================== REGISTER (Sirf OTP Bhejega) =====================

exports.register = async (req, res) => {
  try {
    const { email } = req.body; 

    // 1. Check karo ki user pehle se registered toh nahi hai
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists. Please login." });

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP:", otp);

    // 3. Purana OTP hatao aur naya save karo (Temporary DB me)
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    // 4. Email bhej do
    await sendEmail(email, "Verification OTP", `Your OTP is ${otp}`);

    res.status(201).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


// ===================== VERIFY OTP & CREATE USER =====================

exports.verifyOtp = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      companyName, 
      companySize, 
      otp 
    } = req.body;

    // 1. Temporary DB (Otp model) mein OTP check karo
    const validOtpRecord = await Otp.findOne({ email });

    if (!validOtpRecord)
      return res.status(400).json({ message: "OTP expired or not found" });

    if (validOtpRecord.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // 2. OTP Sahi hai! Ab Password Hash karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. ASLI USER CREATE KARO (Main DB mein)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyName: role === "company" ? companyName : undefined,
      companySize: role === "company" ? companySize : undefined,
      isVerified: true, 
    });

    // 4. OTP verify hone ke baad use delete kar do
    await Otp.deleteMany({ email });

    res.status(201).json({
      message: "Account verified and created successfully",
      role: user.role,
      userId: user._id,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// ===================== FORGOT PASSWORD =====================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found" });

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry =
      Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your reset OTP is ${otp}`);

    res.json({
      message: "Reset OTP sent",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// ===================== VERIFY RESET OTP =====================

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    console.log(`👉 DB OTP: ${user.resetOtp} | Frontend OTP: ${otp}`);

    if (String(user.resetOtp).trim() !== String(otp).trim())
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.resetOtpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    res.json({
      message: "OTP verified",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// ===================== RESET PASSWORD =====================

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found" });

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    res.json({
      message: "Password reset success",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// ===================== GET CURRENT USER =====================

exports.getMe = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};