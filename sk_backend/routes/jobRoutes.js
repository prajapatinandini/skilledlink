const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { protect, companyOnly } = require("../middleware/authMiddleware"); 

// ==========================================
// 🏢 CORE JOB ROUTES
// ==========================================

// 🟢 YE ROUTE MISSING THA! (Students ke liye saari jobs laane ke liye)
router.get("/all", protect, jobController.getAllJobs);

// ✅ Create Job (HireModal)
router.post("/create", protect, companyOnly, jobController.createJob);

// ✅ Get all jobs for specific company (Dashboard / HiredTab)
router.get("/", protect, companyOnly, jobController.getCompanyJobs);

// ✅ Delete Job
router.delete("/:id", protect, companyOnly, jobController.deleteJob);

// ✅ Toggle Pause Job 
router.patch("/:id/toggle", protect, companyOnly, jobController.togglePauseJob);

// ==========================================
// 📝 ADD QUESTIONS TO JOB (Naye Routes)
// ==========================================
router.post("/:jobId/aptitude", protect, companyOnly, jobController.addAptitudeQuestion);
router.post("/:jobId/coding", protect, companyOnly, jobController.addCodingQuestion);

// ==========================================
// 👨‍🎓 APPLICANT / HISTORY ROUTES
// ==========================================
router.get("/:jobId/applicants", protect, jobController.getJobApplicants);
router.get("/application/:appId", protect, companyOnly, jobController.getStudentDetails);
router.get("/placements", protect, jobController.getPlacements);

module.exports = router;