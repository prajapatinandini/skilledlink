const Project = require("../models/Project");
const TestAttempt = require("../models/TestAttempt");
// ================= ADD PROJECT =================
exports.addProject = async (req, res) => {
  try {
    const { title, repoUrl } = req.body;

    if (!title || !repoUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const project = await Project.create({
      userId: req.user._id,   // ✅ FIXED
      title,
      repoUrl
    });

    res.status(201).json({
      message: "Project added successfully",
      project
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= GET USER PROJECTS =================
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }); // ✅ FIXED
    res.json(projects);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= DELETE PROJECT =================
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const deleted = await Project.findOneAndDelete({
      _id: projectId,
      userId: req.user._id   // ✅ FIXED
    });

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


 

// ================= ADD MULTIPLE PROJECTS =================
exports.addMultipleProjects = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User token missing ya invalid hai" });
    }
    const loggedInUserId = req.user._id || req.user.id; 

    const { projects } = req.body; 

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ message: "Please provide an array of projects" });
    }

    // 🚀 THE FINAL FIX: Attempt ID se Job ID (company) nikalna
    const attemptId = projects[0].attemptId;
    if (!attemptId) {
        return res.status(400).json({ message: "Attempt ID is missing" });
    }

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
    }

    const jobId = attempt.company; // 🎯 MIL GAYI JOB ID!

    // 🟢 Safely map projects aur jobId add karo
    const projectsToInsert = projects.map(proj => ({
      userId: loggedInUserId,
      jobId: jobId, // 👈 AB MONGOOSE ERROR NAHI DEGA!
      title: proj.title || "Assessment Project", 
      repoUrl: proj.repoUrl
    }));

    // Mongoose ka insertMany() use karke ek sath saare save karna
    const insertedProjects = await Project.insertMany(projectsToInsert);

    res.status(201).json({
      message: "All projects added successfully",
      projects: insertedProjects
    });

  } catch (err) {
    console.error("❌ Add Multiple Projects Error:", err); 
    res.status(500).json({ error: err.message });
  }
};