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

    // Lean use kiya taaki easily modify kar sakein
    const applications = await TestAttempt.find({ company: { $in: jobIds } })
      .populate('student', 'name email profilePhoto')
      .lean();

    // 🚀 SMART FETCH: Photo pakka laane ke liye StudentProfile fetch kiya
    const studentIds = [...new Set(applications.map(a => a.student?._id?.toString()).filter(Boolean))];
    const profiles = await StudentProfile.find({ user: { $in: studentIds } }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    // Applications ke andar student ki photo insert kar di
    const enrichedApplications = applications.map(app => {
      if (app.student) {
        const profile = profileMap[app.student._id.toString()];
        app.student.profilePhoto = app.student.profilePhoto || (profile ? profile.profilePhoto : null);
      }
      return app;
    });
      
    res.status(200).json({ jobs, applications: enrichedApplications });
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
// 4. TALENT POOL TAB (🚀 FIX: Added Profile Data & Image Logic)
exports.getTalentPoolData = async (req, res) => {
  try {
    const companyId = req.user._id || req.user.id;
    const jobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    // Lean ka use kiya taaki easily modify kar sakein
    const attempts = await TestAttempt.find({ company: { $in: jobIds } })
      .populate('student', 'name email profilePhoto')
      .lean();

    // 🚀 SMART FETCH: Ek hi baar mein saare students ki profile fetch kar li
    const studentIds = [...new Set(attempts.map(a => a.student?._id?.toString()).filter(Boolean))];
    const profiles = await StudentProfile.find({ user: { $in: studentIds } }).lean();
    
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    const talentMap = {};
    attempts.forEach(attempt => {
      const sId = attempt.student?._id?.toString();
      if (!sId) return;
      
      if (!talentMap[sId]) {
        const profile = profileMap[sId] || {}; // Profile data match kiya
        talentMap[sId] = { 
          student: {
            ...attempt.student,
            // 🚀 ProfilePhoto aur College Details yahan mix kar di
            profilePhoto: attempt.student.profilePhoto || profile.profilePhoto,
            college: profile.college || "N/A",
            branch: profile.branch || "N/A",
            batchYear: profile.batchYear || "N/A"
          }, 
          totalScore: 0, totalQuiz: 0, totalCoding: 0, totalProject: 0, 
          totalApps: 0, hiredCount: 0 
        };
      }
      
      talentMap[sId].totalScore += (attempt.finalScore || 0);
      talentMap[sId].totalQuiz += (attempt.aptitudeScore || 0);
      talentMap[sId].totalCoding += (attempt.codingPercentage || 0);
      talentMap[sId].totalProject += (attempt.projectScore || 0);
      talentMap[sId].totalApps += 1;
      if (attempt.status === "Hired") talentMap[sId].hiredCount += 1;
    });

    const talentPool = Object.values(talentMap).map(t => ({
      ...t.student, // Ab isme photo, college, sab hoga
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

// 5. APPLICANT HISTORY (🚀 FIX: Added ProfilePhoto & Resume logic)
exports.getJobAttempts = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // lean() zaruri hai taaki hum object modify kar sakein
    const attempts = await TestAttempt.find({ company: jobId }) 
      .populate("student", "name email profilePhoto resumeUrl")
      .lean(); 
      
    // 🚀 SMART FETCH: Agar photo User schema mein nahi hai, toh StudentProfile mein dhoondho
    const attemptsWithProfiles = await Promise.all(
      attempts.map(async (attempt) => {
        if (attempt.student && attempt.student._id) {
          const profile = await StudentProfile.findOne({ user: attempt.student._id }).lean();
          if (profile) {
            attempt.student.profilePhoto = attempt.student.profilePhoto || profile.profilePhoto;
            attempt.student.resumeUrl = attempt.student.resumeUrl || profile.resumeUrl;
          }
        }
        return attempt;
      })
    );
      
    res.status(200).json({ attempts: attemptsWithProfiles });
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

// 7. GET APPLICANT PROJECTS
exports.getApplicantProjects = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findById(attemptId).populate('student');
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    let projects = await Project.find({ attemptId: attemptId }).lean();
    if (projects.length === 0 && attempt.student) {
      projects = await Project.find({ userId: attempt.student._id }).lean();
    }

    res.status(200).json({
      projects: projects.map(p => ({
        title: p.title || "GitHub Project",
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        score: attempt.projectScore || 0 
      })),
      evaluation: { score: attempt.projectScore || 0 }
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
      { projectScore: projectScore || 0, finalScore: finalScore || 0, status: "completed" },
      { new: true }
    );

    if (!updatedAttempt) return res.status(404).json({ message: "Test attempt not found" });

    res.status(200).json({ message: "Assessment successfully finalized!", attempt: updatedAttempt });
  } catch (error) {
    console.error("Error finalizing assessment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const companyId = req.user._id || req.user.id;
    const totalJobs = await Job.countDocuments({ company: companyId });
    const jobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const totalApplicants = await TestAttempt.countDocuments({ company: { $in: jobIds } });
    const hiredCandidates = await TestAttempt.countDocuments({ company: { $in: jobIds }, status: "Hired" });

    // 1. Fetch Test Attempts (Populating Job titles)
    const allAttempts = await TestAttempt.find({ 
      company: { $in: jobIds }, 
      status: { $in: ["completed", "In Review", "Hired", "Rejected"] } 
    })
    .populate("student", "name email profilePhoto") 
    .populate("company", "title") // Agar job ka ID 'company' field me save hai
    .populate("jobId", "title")   // Agar job ka ID 'jobId' field me save hai
    .lean(); // Lean zaroori hai taaki data fast aur modify ho sake

    // 2. 🚀 SMART FETCH: Photo nikaalne ke liye StudentProfile fetch kar rahe hain
    const studentIds = [...new Set(allAttempts.map(a => a.student?._id?.toString()).filter(Boolean))];
    
    // (Ensure karna ki StudentProfile top pe require/import kiya hua ho)
    const StudentProfile = require("../models/StudentProfile"); // Agar top me hai toh is line ko hata dena
    const profiles = await StudentProfile.find({ user: { $in: studentIds } }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    // 3. Top Students Map & Sort
    const topStudents = allAttempts.map(a => {
      const sId = a.student?._id?.toString();
      const profile = profileMap[sId] || {};

      // Job title nikaalne ka solid tareeqa
      const finalJobTitle = a.company?.title || a.jobId?.title || "Role not specified";

      // Photo nikaalne ka solid tareeqa
      const finalPhoto = a.student?.profilePhoto || profile.profilePhoto || null;

      return {
        id: a.student?._id,
        name: a.student?.name || "Unknown Applicant",
        jobTitle: finalJobTitle, // 🚀 Backend se directly title ja raha hai
        percentage: Math.round(a.finalScore || 0),
        img: finalPhoto // 🚀 Backend se proper photo ja rahi hai
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3); // Sirf top 3 bacche

    res.status(200).json({ totalJobs, totalApplicants, hiredCandidates, topStudents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 8. GET PORTFOLIO DATA 
exports.getStudentPortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await StudentProfile.findById(id).populate('user', 'name email profilePhoto resumeUrl');
    let user = profile ? profile.user : await User.findById(id).select('name email profilePhoto resumeUrl');

    if (!user) return res.status(404).json({ error: "Student not found" });
    if (!profile) profile = await StudentProfile.findOne({ user: user._id });

    const attempts = await TestAttempt.find({ student: user._id }).sort({ createdAt: -1 });

    const latestAttempt = attempts[0]; 
    const quizScore = latestAttempt ? Math.round(latestAttempt.aptitudeScore || 0) : 0;
    const codingScore = latestAttempt ? Math.round(latestAttempt.codingPercentage || 0) : 0;
    const projectScore = latestAttempt ? Math.round(latestAttempt.projectScore || 0) : 0;
    const finalScore = latestAttempt ? Math.round(latestAttempt.finalScore || 0) : 0;

    const projects = await Project.find({ userId: user._id }).lean();

    res.status(200).json({
      name:         user.name,
      email:        user.email,
      profilePhoto: profile?.profilePhoto || user.profilePhoto || null,
      resumeUrl:    profile?.resumeUrl || user.resumeUrl || null,
      degree:       profile?.branch    || "N/A",  
      college:      profile?.college   || "N/A",
      year:         profile?.batchYear?.toString() || "N/A",
      about:        profile?.bio || profile?.experience || "Bio not available.", 
      phone:        profile?.phone     || "N/A",
      github:       profile?.githubUsername || "N/A",
      linkedin:     profile?.linkedin  || "N/A",
      quizScore,     
      codingScore,   
      projectScore,  
      finalScore,    
      skills:       profile?.skills    || [],
      projects:     projects.map(p => ({ title: p.title, repoUrl: p.repoUrl })), 
      experience:   profile?.experience ? [{ role: profile.experience, company: "Previous Work", duration: "N/A" }] : [],
      achievements: profile?.achievements ? [profile.achievements] : [],
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};