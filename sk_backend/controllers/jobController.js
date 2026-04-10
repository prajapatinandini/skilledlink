const Job = require("../models/Job");
const Application = require("../models/Application"); 
const User = require("../models/User"); 
const CompanyProfile = require("../models/CompanyProfile");

// ==========================================
// 1️⃣ GET ALL JOBS (🚀 OPTIMIZED: No N+1 Query Problem)
// ==========================================
exports.getAllJobs = async (req, res) => {
  try {
    // 1. Saari active jobs layein
    const jobs = await Job.find({ isPaused: false }).lean().sort({ createdAt: -1 });

    // 2. Extract all unique company IDs from jobs
    const companyIds = [...new Set(jobs.map(job => job.company).filter(Boolean))];

    // 3. Sirf 1 DB call mein saari companies ki profile le aao! ($in operator)
    const companyProfiles = await CompanyProfile.find({ owner: { $in: companyIds } }).lean();

    // Map bana lo taaki search instant ho (O(1) time complexity)
    const profileMap = {};
    companyProfiles.forEach(profile => {
      profileMap[profile.owner.toString()] = profile;
    });

    // 4. Har job ke andar company details map karo
    for (let i = 0; i < jobs.length; i++) {
      const compId = jobs[i].company ? jobs[i].company.toString() : null;
      const profile = profileMap[compId];

      if (profile) {
        jobs[i].company = {
          _id: profile._id,
          companyName: profile.companyName,
          name: profile.companyName, 
          industry: profile.industry,
          location: profile.location,
          logo: profile.logo,
          website: profile.website,
          description: profile.description 
        };
      } else {
         jobs[i].company = { _id: jobs[i].company || "unknown", companyName: "Unknown Company" };
      }
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error("🔥 GET ALL JOBS ERROR:", error.message); 
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2️⃣ CREATE JOB (With Credits & Expiry)
// ==========================================
exports.createJob = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const postCost = 100; 

    const companyUser = await User.findById(userId);
    if (!companyUser) return res.status(404).json({ message: "Company User not found" });

    if (companyUser.credits < postCost) {
      return res.status(402).json({ 
        success: false, 
        message: `Insufficient credits! You need ${postCost} credits. Current balance: ${companyUser.credits}` 
      });
    }

    companyUser.credits -= postCost;
    await companyUser.save();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const {
      title, experience, salary, skillsInput, languagesInput, daysLeft, description, 
      quiz, coding 
    } = req.body;

    const skills = skillsInput ? skillsInput.split(",").map(s => s.trim()) : [];
    const languages = languagesInput ? languagesInput.split(",").map(l => l.trim()) : [];

    const job = await Job.create({
      company: userId, 
      title, experience, salary, skills, languages, daysLeft, description,
      isPaused: false,
      isExpired: false,        
      expiresAt: expiryDate,   
      quiz: quiz || [],     
      coding: coding || []  
    });

    res.status(201).json({
      success: true,
      message: `Job created successfully! ${postCost} credits deducted. 🎉`,
      job,
      remainingCredits: companyUser.credits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 3️⃣ ADD APTITUDE QUESTION(S) (🚀 SMART LOGIC)
// ==========================================
exports.addAptitudeQuestion = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { question, options, correctAnswer, marks, questions } = req.body;

    const job = await Job.findOne({ _id: jobId, company: req.user._id || req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found or Unauthorized" });

    // Agar array aaya hai toh saare ek sath daal do, warna single daalo
    if (questions && Array.isArray(questions)) {
      job.quiz.push(...questions);
    } else if (question) {
      job.quiz.push({ question, options, correctAnswer, marks: marks || 1 });
    } else {
      return res.status(400).json({ message: "No question data provided" });
    }
    
    await job.save();

    res.status(201).json({ message: "Aptitude question(s) added successfully ✅", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4️⃣ ADD CODING QUESTION(S) (🚀 SMART LOGIC)
// ==========================================
exports.addCodingQuestion = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, difficulty, marks, testCases, sampleInput, sampleOutput, constraints, questions } = req.body;

    const job = await Job.findOne({ _id: jobId, company: req.user._id || req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found or Unauthorized" });

    // Agar array aaya hai toh saare ek sath daal do, warna single daalo
    if (questions && Array.isArray(questions)) {
      job.coding.push(...questions);
    } else if (title) {
      job.coding.push({
        title, description, difficulty, marks: marks || 10, testCases, sampleInput, sampleOutput, constraints
      });
    } else {
      return res.status(400).json({ message: "No coding question data provided" });
    }
    
    await job.save();

    res.status(201).json({ message: "Coding question(s) added successfully ✅", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 5️⃣ GET ALL JOBS FOR COMPANY (HiredTab load)
// ==========================================
exports.getCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id || req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6️⃣ TOGGLE PAUSE STATUS (Pause/Resume Btn)
// ==========================================
exports.togglePauseJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, company: req.user._id || req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isPaused = !job.isPaused;
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error updating job status" });
  }
};

// ==========================================
// 7️⃣ DELETE JOB (Remove Position Btn)
// ==========================================
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, company: req.user._id || req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    
    // Agar Applications delete karni hain toh:
    if(Application) await Application.deleteMany({ job: req.params.id });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job" });
  }
};

// ==========================================
// 8️⃣ GET SINGLE STUDENT DETAILS (StudentDetailModal)
// ==========================================
exports.getStudentDetails = async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await Application.findById(appId)
      .populate("student")
      .populate("job");

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      applicant: app,
      job: app.job
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 9️⃣ GET JOB APPLICANTS (History Modal)
// ==========================================
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate("student", "name avatar profilePic img") 
      .sort({ createdAt: -1 }); 

    const formattedData = applications.map(app => ({
      id: app._id,
      name: app.student?.name || "Unknown Student",
      img: app.student?.avatar || app.student?.profilePic || app.student?.img || `https://ui-avatars.com/api/?name=${app.student?.name || 'U'}&background=f3f0ff&color=553f9a`,
      status: app.status || "Pending",
      date: new Date(app.createdAt).toDateString(),
      quiz: app.quizScore || 0,
      coding: app.codingScore || 0
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
};

// ==========================================
// 🔟 GET PLACEMENTS (Hired Students)
// ==========================================
exports.getPlacements = async (req, res) => {
  try {
    const hiredApps = await Application.find({ status: "Hired" })
      .populate("student", "name avatar degree college skills")
      .populate("job", "title");

    const formattedData = hiredApps.map(app => ({
      id: app.student?._id || app._id,
      name: app.student?.name || "Unknown",
      img: app.student?.avatar || `https://ui-avatars.com/api/?name=${app.student?.name || 'S'}&background=f3f0ff&color=553f9a`,
      jobTitle: app.job?.title || "Software Developer",
      date: new Date(app.updatedAt || app.createdAt).toDateString(),
      quiz: app.quizScore || 0,
      coding: app.codingScore || 0,
      degree: app.student?.degree || "B.Tech",
      college: app.student?.college || "Tech University",
      skills: app.student?.skills || []
    }));

    // Deduplicate logic
    const seen = new Set();
    const uniquePlacements = formattedData.filter(a => {
      if (seen.has(a.name)) return false;
      seen.add(a.name);
      return true;
    });

    res.status(200).json(uniquePlacements);
  } catch (error) {
    console.error("Error fetching placements:", error);
    res.status(500).json({ error: "Failed to fetch placements" });
  }
};