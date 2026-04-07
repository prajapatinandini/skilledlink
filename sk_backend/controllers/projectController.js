const Project = require("../models/Project");

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
    // 🟢 FIX 1: Ensure user is logged in and safely extract ID
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User token missing ya invalid hai" });
    }
    const loggedInUserId = req.user._id || req.user.id; // Safe extraction

    const { projects } = req.body; 

    // Validation
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ message: "Please provide an array of projects" });
    }

    // 🟢 FIX 2: Safely map projects with fallback values
    const projectsToInsert = projects.map(proj => ({
      userId: loggedInUserId,  
      title: proj.title || "Assessment Project", // Agar title empty hua toh error nahi aayega
      repoUrl: proj.repoUrl,
      attemptId: proj.attemptId 
    }));

    // Mongoose ka insertMany() use karke ek sath saare save karna
    const insertedProjects = await Project.insertMany(projectsToInsert);

    res.status(201).json({
      message: "All projects added successfully",
      projects: insertedProjects
    });

  } catch (err) {
    // 🟢 FIX 3: Agar fir bhi fail ho, toh terminal me EXACT ERROR print karega
    console.error("❌ Add Multiple Projects Error:", err); 
    res.status(500).json({ error: err.message });
  }
};