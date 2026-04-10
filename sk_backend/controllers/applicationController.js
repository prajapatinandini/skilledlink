const Application = require("../models/Application");
const Project = require("../models/Project");
const { evaluateProject } = require("./evaluationController");
const User = require("../models/User");
const Job = require("../models/Job");
const TestAttempt = require("../models/TestAttempt");

// 👇 YAHAN MAINE CURLY BRACKETS { } LAGA DIYE HAIN 👇
const { sendStatusEmail } = require("../utils/sendEmail");

// Submit GitHub Project

exports.submitGithubProject = async (req, res) => {
  try {
    const { applicationId, githubUrl } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      student: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.stage !== "github") {
      return res.status(400).json({ message: "GitHub already submitted" });
    }

    // Save project in Project collection (your existing model)
    const project = await Project.create({
      userId: req.user._id,
      repoUrl: githubUrl
    });

    // Evaluate using your existing AI system
    req.body.projectId = project._id;
    await evaluateProject(req, res);

    // Get evaluation result
    const evaluation = await require("../models/Evaluation")
      .findOne({ projectId: project._id });

    // Update application
    application.githubUrl = githubUrl;
    application.githubScore = evaluation.finalScore;
    application.stage = "aptitude";
    await application.save();

    res.json({
      message: "GitHub submitted & evaluated",
      githubScore: evaluation.finalScore,
      nextStage: "aptitude unlocked"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTalentPool = async (req, res) => {
  try {
    // 1. Saare students ko database se nikalo
    const students = await User.find({ role: "student" }); 
    
    // 2. Saari applications ko nikalo
    const applications = await Application.find();

    // 3. Har student ke data ke sath uski applications ka summary jodo
    const enrichedData = students.map(student => {
      // Is particular student ki saari applications dhoondho
      const studentApps = applications.filter(a => a.student.toString() === student._id.toString());
      
      // Hired count nikalo
      const hiredCount = studentApps.filter(a => a.status === "Hired").length;
      
      // Average Score nikalo
      let avgScore = student.percentage || 0;
      if (studentApps.length > 0) {
        const totalScore = studentApps.reduce((sum, a) => sum + ((a.quizScore || 0) + (a.codingScore || 0)) / 2, 0);
        avgScore = Math.round(totalScore / studentApps.length);
      }

      return {
        id: student._id,
        name: student.name,
        img: student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=f3f0ff&color=553f9a`,
        percentage: student.percentage || 0,
        port: {
          degree: student.degree || "B.Tech",
          college: student.college || "Tech University",
          year: student.year || "2025",
          skills: student.skills || []
        },
        apps: studentApps.length,
        hired: hiredCount,
        avgScore: avgScore
      };
    });

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error("Error fetching talent pool:", error);
    res.status(500).json({ error: "Failed to fetch talent pool" });
  }
};


exports.getAnalytics = async (req, res) => {
  try {
    // 1. Saari applications dhoondhein aur usme student aur job detail jodein
    const allApps = await Application.find()
      .populate("student", "name avatar img")
      .populate("job", "title");

    // 2. Saari jobs dhoondhein
    const jobs = await Job.find();

    // 3. Frontend ke hisaab se Data ko map karein
    const formattedApps = allApps.map(a => ({
      id: a._id,
      jid: a.job?._id,
      name: a.student?.name || "Unknown",
      img: a.student?.avatar || a.student?.img || `https://ui-avatars.com/api/?name=${a.student?.name || 'S'}&background=f3f0ff&color=553f9a`,
      status: a.status || "Pending",
      quiz: a.quizScore || 0,
      coding: a.codingScore || 0
    }));

    const formattedJobs = jobs.map(j => ({
      id: j._id,
      title: j.title
    }));

    // Ek hi baar mein dono cheezein bhej dein
    res.status(200).json({
      applications: formattedApps,
      jobs: formattedJobs
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};


exports.getDashboardData = async (req, res) => {
  try {
    // 1. Total Jobs
    const jobsCount = await Job.countDocuments();
    
    // 2. Applications Stats
    const applications = await Application.find();
    const appliedCount = applications.length;
    const hiredCount = applications.filter(app => app.status === "Hired").length;
    
    // 3. Partner Companies (Aap isko apne logic se count kar sakte hain, abhi default 8 bhej rahe hain)
    const companiesCount = 8; 

    // 4. Top Students (Score ke hisaab se sort karke top 3 nikalna)
    const topStudentsData = await User.find({ role: "student" })
      .sort({ percentage: -1 }) // Highest percentage wale pehle
      .limit(3);

    const topStudents = topStudentsData.map((s, index) => ({
      id: s._id,
      rank: index + 1,
      name: s.name,
      img: s.avatar || `https://ui-avatars.com/api/?name=${s.name}&background=f3f0ff&color=553f9a`,
      percentage: s.percentage || 0
    }));

    res.status(200).json({
      stats: {
        applied: appliedCount,
        hired: hiredCount,
        companies: companiesCount,
        jobs: jobsCount
      },
      topStudents
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// 👇 IS FUNCTION KO APNE CONTROLLER MEIN REPLACE KAR LO 👇
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const attemptId = req.params.id; 

    // Bacche ka data nikal rahe hain
    const attempt = await TestAttempt.findById(attemptId)
      .populate("student", "name email") 
      .populate("company", "title companyName"); 

    if (!attempt) return res.status(404).json({ message: "Candidate record not found" });

    // 1. Status DB mein save kar rahe hain (Ye pehle hona chahiye)
    attempt.status = status;
    await attempt.save();

    // 2. EMAIL BHEJNE KA LOGIC
    if (status === "Hired" || status === "Rejected") {
      const companyName = attempt.company?.companyName || attempt.company?.title || "Our Company"; 
      
      console.log(`👉 Sending background email to: ${attempt.student.email}`);
      
      // 🚀 FIX: Yahan se 'await' hata diya hai! 
      // Ab ye line background mein chalegi aur server response turant bhej dega.
      sendStatusEmail(attempt.student.email, attempt.student.name, status, companyName);
    }

    // 3. Response turant bhej rahe hain
    res.status(200).json({ 
      success: true, 
      message: `Status updated to ${status}! Email process started in background. 📧` 
    });

  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Something went wrong on the server!" });
  }
};