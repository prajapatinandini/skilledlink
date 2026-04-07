const Job = require('../models/Job');
const TestAttempt = require('../models/TestAttempt');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Project = require('../models/Project');
const Evaluation = require('../models/Evaluation');

// Helper Function: Company ki saari jobs ke IDs nikalne ke liye
const getCompanyJobIds = async (companyId) => {
  const jobs = await Job.find({ company: companyId }).select('_id');
  return jobs.map(job => job._id);
};

// 2. ANALYTICS TAB
exports.getAnalyticsData = async (req, res) => {
  try {
    const companyId = req.user._id || req.user.id;
    const jobs = await Job.find({ company: companyId });
    const jobIds = jobs.map(j => j._id);

    const applications = await TestAttempt.find({ company: { $in: jobIds } })
      .populate('student', 'name email');
      
    res.status(200).json({ jobs, applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. PLACEMENTS TAB
exports.getPlacementsData = async (req, res) => {
  try {
    const companyId = req.user._id || req.user.id;
    const jobIds = await getCompanyJobIds(companyId);

    const hiredAttempts = await TestAttempt.find({ company: { $in: jobIds }, status: "Hired" })
      .populate('student', 'name email companyName companySize') 
      .populate('company', 'title'); 
      
    res.status(200).json(hiredAttempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. TALENT POOL TAB
exports.getTalentPoolData = async (req, res) => {
  try {
    const companyId = req.user._id || req.user.id;
    const jobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const attempts = await TestAttempt.find({ company: { $in: jobIds } }).populate('student', 'name email');

    const talentMap = {};
    attempts.forEach(attempt => {
      const sId = attempt.student?._id?.toString();
      if (!sId) return;
      
      if (!talentMap[sId]) {
        // Naye variables add kiye teeno scores ke liye
        talentMap[sId] = { 
          student: attempt.student, 
          totalScore: 0, totalQuiz: 0, totalCoding: 0, totalProject: 0, 
          totalApps: 0, hiredCount: 0 
        };
      }
      
      // Seedha database ke numbers add kar rahe hain
      talentMap[sId].totalScore += (attempt.finalScore || 0);
      talentMap[sId].totalQuiz += (attempt.aptitudeScore || 0);
      talentMap[sId].totalCoding += (attempt.codingPercentage || 0);
      talentMap[sId].totalProject += (attempt.projectScore || 0);
      talentMap[sId].totalApps += 1;
      if (attempt.status === "Hired") talentMap[sId].hiredCount += 1;
    });

    const talentPool = Object.values(talentMap).map(t => ({
      ...t.student._doc,
      // Frontend ko exact averages bhej rahe hain
      avgScore: Math.round(t.totalScore / t.totalApps),
      quiz: Math.round(t.totalQuiz / t.totalApps),
      coding: Math.round(t.totalCoding / t.totalApps),
      project: Math.round(t.totalProject / t.totalApps),
      apps: t.totalApps,
      hired: t.hiredCount
    }));

    res.status(200).json(talentPool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. APPLICANT HISTORY
exports.getJobAttempts = async (req, res) => {
  try {
    const { jobId } = req.params;
    const attempts = await TestAttempt.find({ company: jobId }) 
      .populate("student", "name email");
      
    res.status(200).json({ attempts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. UPDATE STATUS
exports.updateAttemptStatus = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { status } = req.body; 

    const attempt = await TestAttempt.findByIdAndUpdate(
      attemptId, 
      { status: status }, 
      { new: true }
    );

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    res.status(200).json({ message: `Status updated to ${status}`, attempt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. GET APPLICANT PROJECTS (Data for HR Dashboard Modal)
exports.getApplicantProjects = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // 1. Fetch Attempt
    const attempt = await TestAttempt.findById(attemptId).populate('student');
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // 2. Fetch Projects (Pehle attemptId se try karo, warna student userId se nikal lo)
    let projects = await Project.find({ attemptId: attemptId }).lean();
    
    if (projects.length === 0 && attempt.student) {
      // Fallback: agar attemptId se link nahi hue, toh student ki purani ID se le lo
      projects = await Project.find({ userId: attempt.student._id }).lean();
    }

    // 3. Send Response
    res.status(200).json({
      projects: projects.map(p => ({
        title: p.title || "GitHub Project",
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        score: attempt.projectScore || 0 
      })),
      evaluation: { 
        score: attempt.projectScore || 0 
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};



// 9. FINAL SUBMIT
exports.finalizeAssessment = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { projectScore, finalScore } = req.body; 

    const updatedAttempt = await TestAttempt.findByIdAndUpdate(
      attemptId,
      { 
        projectScore: projectScore || 0,
        finalScore: finalScore || 0,
        status: "completed" 
      },
      { new: true }
    );

    if (!updatedAttempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    res.status(200).json({ message: "Assessment successfully finalized!", attempt: updatedAttempt });
  } catch (error) {
    console.error("Error finalizing assessment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 1. DASHBOARD TAB (Top Students list mein exact Final Score dikhane ke liye)
exports.getDashboardData = async (req, res) => {
  try {
    const companyId = req.user._id || req.user.id;
    const totalJobs = await Job.countDocuments({ company: companyId });
    
    const jobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const totalApplicants = await TestAttempt.countDocuments({ company: { $in: jobIds } });
    const hiredCandidates = await TestAttempt.countDocuments({ company: { $in: jobIds }, status: "Hired" });

    const allAttempts = await TestAttempt.find({ 
      company: { $in: jobIds }, 
      status: { $in: ["completed", "In Review", "Hired", "Rejected"] } 
    }).populate("student", "name email");

    // 🟢 EXACT DB MAPPING: Seedha finalScore utha rahe hain (No calculation)
    const topStudents = allAttempts.map(a => ({
      id: a.student?._id,
      name: a.student?.name,
      percentage: Math.round(a.finalScore || 0) // Yahan 27 aayega
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

    res.status(200).json({ totalJobs, totalApplicants, hiredCandidates, topStudents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 8. GET PORTFOLIO DATA (Portfolio Modal mein exact 4 scores dikhane ke liye)
exports.getStudentPortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await StudentProfile.findById(id).populate('user', 'name email');
    let user = profile ? profile.user : await User.findById(id).select('name email');

    if (!user) return res.status(404).json({ error: "Student not found" });
    if (!profile) profile = await StudentProfile.findOne({ user: user._id });

    // 🟢 Student ke saare attempts nikale aur sabse latest wala sabse upar rakha
    const attempts = await TestAttempt.find({ student: user._id }).sort({ createdAt: -1 });

    // 🟢 EXACT DB MAPPING: Latest attempt ke exact numbers (Average karna band kar diya)
    const latestAttempt = attempts[0]; 
    const quizScore = latestAttempt ? Math.round(latestAttempt.aptitudeScore || 0) : 0;
    const codingScore = latestAttempt ? Math.round(latestAttempt.codingPercentage || 0) : 0;
    const projectScore = latestAttempt ? Math.round(latestAttempt.projectScore || 0) : 0;
    const finalScore = latestAttempt ? Math.round(latestAttempt.finalScore || 0) : 0;

    const projects = await Project.find({ userId: user._id }).lean();

    res.status(200).json({
      name:         user.name,
      email:        user.email,
      degree:       profile?.branch    || "N/A",  
      college:      profile?.college   || "N/A",
      year:         profile?.batchYear?.toString() || "N/A",
      about:        profile?.bio || profile?.experience || "Bio not available.", 
      phone:        profile?.phone     || "N/A",
      github:       profile?.githubUsername || "N/A",
      linkedin:     profile?.linkedin  || "N/A",
      // 🟢 Charo exact numbers frontend ko bhej diye
      quizScore,     // 33
      codingScore,   // 0
      projectScore,  // 44
      finalScore,    // 27
      skills:       profile?.skills    || [],
      projects:     projects.map(p => ({ title: p.title, repoUrl: p.repoUrl })), 
      experience:   profile?.experience ? [{ role: profile.experience, company: "Previous Work", duration: "N/A" }] : [],
      achievements: profile?.achievements ? [profile.achievements] : [],
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};