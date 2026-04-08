const Job = require("../models/Job");
const Application = require("../models/Application"); 
const User = require("../models/User"); 
const CompanyProfile = require("../models/CompanyProfile");

exports.getAllJobs = async (req, res) => {
  try {
    // 1. Saari active jobs layein
    const jobs = await Job.find({ isPaused: false }).lean().sort({ createdAt: -1 });

    // 2. Har job ke liye Company ka naam aur baaki details dhundhein
    for (let i = 0; i < jobs.length; i++) {
      // Safety Check: Agar job mein company ki ID hi missing hai
      if (!jobs[i].company) {
         jobs[i].company = { _id: "unknown", companyName: "Unknown Company" };
         continue;
      }

      // Company profile dhundhein
      const profile = await CompanyProfile.findOne({ owner: jobs[i].company });
      
      if (profile) {
        jobs[i].company = {
          _id: profile._id,
          companyName: profile.companyName,
          name: profile.companyName, 
          industry: profile.industry,
          location: profile.location,
          logo: profile.logo,
          // 🚀 NAYI FIELDS YAHAN ADD KI HAIN 👇
          website: profile.website,
          description: profile.description 
        };
      } else {
         jobs[i].company = { _id: jobs[i].company, companyName: "Unknown Company" };
      }
    }

    res.status(200).json(jobs);
  } catch (error) {
    // 🔴 YEH LINE AAPKO TERMINAL MEIN ASLI ERROR BATAYEGI 🔴
    console.error("🔥 GET ALL JOBS MEIN ERROR AAYA:", error.message); 
    console.error(error); // Pura kachra (stack trace) print karega

    res.status(500).json({ error: error.message });
  }
};


exports.createJob = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const postCost = 100; // Ek job post karne ke credits

    // 🔴 THE NEW FIX: 1. Fetch Company User & Check Credits
    const companyUser = await User.findById(userId);
    if (!companyUser) return res.status(404).json({ message: "Company User not found" });

    if (companyUser.credits < postCost) {
      return res.status(402).json({ 
        success: false, 
        message: `Insufficient credits! You need ${postCost} credits. Current balance: ${companyUser.credits}` 
      });
    }

    // 🟢 THE NEW FIX: 2. Deduct 100 Credits
    companyUser.credits -= postCost;
    await companyUser.save();

    // ⏳ THE NEW FIX: 3. Set Expiry Date (30 Days from today)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const {
      title, experience, salary, skillsInput, languagesInput, daysLeft, description, 
      quiz, coding 
    } = req.body;

    const skills = skillsInput ? skillsInput.split(",").map(s => s.trim()) : [];
    const languages = languagesInput ? languagesInput.split(",").map(l => l.trim()) : [];

    // 🛠️ THE NEW FIX: 4. Create Job with Expiry Info
    const job = await Job.create({
      company: userId, 
      title, experience, salary, skills, languages, daysLeft, description,
      isPaused: false,
      isExpired: false,        // Auto pause ke liye fallback
      expiresAt: expiryDate,   // 30 din baad ki date
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
// 2️⃣ ADD APTITUDE QUESTION (AddQuestionModal se)
// ==========================================
exports.addAptitudeQuestion = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { question, options, correctAnswer, marks } = req.body;

    const job = await Job.findOne({ _id: jobId, company: req.user._id || req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found or Unauthorized" });

    // Job ke andar quiz array mein naya question daalna
    job.quiz.push({ question, options, correctAnswer, marks: marks || 1 });
    await job.save();

    res.status(201).json({ message: "Aptitude question added successfully ✅", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 3️⃣ ADD CODING QUESTION (AddQuestionModal se)
// ==========================================
exports.addCodingQuestion = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, difficulty, marks, testCases, sampleInput, sampleOutput, constraints } = req.body;

    const job = await Job.findOne({ _id: jobId, company: req.user._id || req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found or Unauthorized" });

    // Job ke andar coding array mein naya problem daalna
    job.coding.push({
      title,
      description,
      difficulty,
      marks: marks || 10,
      testCases,
      sampleInput,
      sampleOutput,
      constraints
    });
    
    await job.save();

    res.status(201).json({ message: "Coding question added successfully ✅", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4️⃣ GET ALL JOBS FOR COMPANY (HiredTab load)
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
// 5️⃣ TOGGLE PAUSE STATUS (Pause/Resume Btn)
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
// 6️⃣ DELETE JOB (Remove Position Btn)
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


// 7️⃣ GET APPLICANTS (History Modal ke liye)

exports.getApplicants = async (req, res) => {
  try {
    if(!Application) return res.json([]); // Guard clause
    
    // 1. Application model mein se wo applications dhoondho jinki 'job' ID match karti ho
    // 2. '.populate("student")' se us application ke andar student ka naam aur photo bhi le aao
    const apps = await Application.find({ job: req.params.jobId }).populate("student");

    // 3. Data ko waise format karo jaisa HistoryModal.jsx ko chahiye
    const formatted = apps.map(a => ({
      id: a._id,
      name: a.student?.name || "Unknown",
      img: a.student?.avatar || "/default.png",
      status: a.status,
      date: a.appliedAt ? new Date(a.appliedAt).toDateString() : new Date().toDateString(),
      quiz: a.quizScore,
      coding: a.codingScore
    }));
    
    // 4. Frontend ko array bhej do
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
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



exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Database se is job ki saari applications dhoondhein
    // 2. .populate('student') ka use karke student ki details (name, img) bhi sath le aayen
    const applications = await Application.find({ job: jobId })
      .populate("student", "name avatar profilePic img") 
      .sort({ createdAt: -1 }); // Nayi applications pehle dikhane ke liye

    // 3. Frontend ke HistoryModal ko jaisa data chahiye, us format mein map karein
    const formattedData = applications.map(app => ({
      id: app._id,
      name: app.student?.name || "Unknown Student",
      // Agar image nahi hai toh ui-avatars se ek default image bana dega
      img: app.student?.avatar || app.student?.profilePic || app.student?.img || `https://ui-avatars.com/api/?name=${app.student?.name || 'U'}&background=f3f0ff&color=553f9a`,
      status: app.status || "Pending",
      date: new Date(app.createdAt).toDateString(),
      quiz: app.quizScore || 0,
      coding: app.codingScore || 0
    }));

    // 4. Data frontend ko bhej dein
    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
};



exports.getPlacements = async (req, res) => {
  try {
    // Sirf wahi applications dhundho jinka status "Hired" hai
    // Saath mein Student ki details (name, img, skills) aur Job ki details (title) bhi populate karo
    const hiredApps = await Application.find({ status: "Hired" })
      .populate("student", "name avatar degree college skills")
      .populate("job", "title");

    // Frontend ko jaisa data chahiye, usme map kar do
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

    // Deduplicate logic (Ek student ka naam ek hi baar aaye)
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



