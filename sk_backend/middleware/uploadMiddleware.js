const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 🟢 1. CLOUDINARY CONFIGURATION
// In details ko Cloudinary Dashboard se nikal kar yahan daalein ya .env file mein rakhein
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🟢 2. CLOUDINARY STORAGE SETTINGS
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = "skilledlink_others";
    let resourceType = "auto"; // PDF/Docs ke liye auto zaroori hai

    if (file.fieldname === "profilePhoto") {
      folderName = "skilledlink_profiles";
      resourceType = "image";
    } else if (file.fieldname === "resume") {
      folderName = "skilledlink_resumes";
      resourceType = "raw"; // Raw format PDF/Docs ke liye best hai
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      public_id: Date.now() + "-" + file.originalname.split('.')[0], // File ka naam unique banane ke liye
    };
  },
});

// 🟢 3. FILE FILTER (Aapka purana filter logic)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
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
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed for profile photo"), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

module.exports = upload;