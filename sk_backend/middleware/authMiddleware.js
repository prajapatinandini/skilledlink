const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded); // 👈 ADD THIS

    const user = await User.findById(decoded.id);

    console.log("USER FROM DB:", user); // 👈 ADD THIS

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};


// 🏢 Company Only Middleware
exports.companyOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "company") {
    return res.status(403).json({ message: "Company access only" });
  }
  next();
};


// 🎓 Student Only Middleware
exports.studentOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};