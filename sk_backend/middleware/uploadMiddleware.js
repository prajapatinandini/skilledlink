const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const dir = "./uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    // Resume ke liye PDF ya Word documents allow karein
    if (
      file.mimetype === "application/pdf" || 
      file.mimetype === "application/msword" || 
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOC files allowed for resume"), false);
    }
  } else if (file.fieldname === "profilePhoto") {
    // Profile Photo ke liye sirf Images allow karein
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed for profile photo"), false);
    }
  } else {
    // Agar koi extra file aati hai toh allow kar de
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size limit lagana safe rehta hai
});

module.exports = upload;