const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    college: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String },
    batchYear: { type: Number },
    phone: { type: String },
    linkedin: { type: String },
    skills: { 
      type: [String], 
      default: [] 
    }, // Production: Array of strings without limits
    githubUsername: { type: String, required: true },
    experience: { type: String },
    achievements: { type: String },
    resumeUrl: { type: String },
    profilePhoto: { type: String },
    techStack: { 
      type: [String], 
      default: [] 
    }, // Production: Array of strings without enum limits
    profileCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Model Create kiya
const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

// 🔥 SMART FIX: Server start hote hi sirf ek baar check karega aur galat index ko uda dega
StudentProfile.init().then(() => {
  StudentProfile.collection.dropIndex("email_1")
    .then(() => console.log("✅ Old 'email' duplicate rule permanently deleted!"))
    .catch(() => {}); // Agar index pehle hi delete ho chuka hai, toh bina kisi error ke aage badh jayega
});

// Model Export kiya
module.exports = StudentProfile;