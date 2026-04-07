const StudentProfile = require("../models/StudentProfile");

// ================= COMPLETE PROFILE =================
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { 
      college, branch, semester, skills, githubUsername, techStack,
      phone, linkedin, batchYear, experience, achievements 
    } = req.body;

    // 1. Check Mandatory Fields
    if (!college || !branch || !skills || !githubUsername) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    // 2. Process Skills safely (No strict restrictions)
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];

    // 3. Process Tech Stack safely (No strict 'allowedTech' restrictions anymore)
    const techStackArray = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string' ? techStack.split(",").map(t => t.trim()).filter(Boolean) : [];

    // 4. Handle multiple file uploads
    let resumeUrl;
    let profilePhotoUrl;
    
    if (req.files) {
      if (req.files['resume'] && req.files['resume'][0]) {
        resumeUrl = `/uploads/${req.files['resume'][0].filename}`;
      }
      if (req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
        profilePhotoUrl = `/uploads/${req.files['profilePhoto'][0].filename}`;
      }
    } else if (req.file) {
      if (req.file.fieldname === 'resume') resumeUrl = `/uploads/${req.file.filename}`;
      if (req.file.fieldname === 'profilePhoto') profilePhotoUrl = `/uploads/${req.file.filename}`;
    }

    // 5. Build Profile Data
    const profileData = {
      user: userId,
      college,
      branch,
      semester,
      phone,
      linkedin,
      skills: skillsArray,
      githubUsername,
      techStack: techStackArray,
      experience,
      achievements,
      profileCompleted: true
    };

    // 🔥 FIX: Safely handle batchYear to prevent CastError
    if (batchYear && String(batchYear).trim() !== "") {
      profileData.batchYear = Number(batchYear);
    }

    if (resumeUrl) profileData.resumeUrl = resumeUrl;
    if (profilePhotoUrl) profileData.profilePhoto = profilePhotoUrl;

    // 6. Save to Database
    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: "Profile completed successfully",
      profile
    });

  } catch (err) {
    console.error("Complete Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};


// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile
      .findOne({ user: req.user._id })
      .populate("user", "-password");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = {};

    const allowedFields = [
      "college", "branch", "semester", "batchYear", "phone", 
      "linkedin", "skills", "githubUsername", "techStack", 
      "experience", "achievements"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // 🔥 FIX: Safely handle empty batchYear in update
        if (field === "batchYear") {
          if (String(req.body[field]).trim() !== "") {
            updates[field] = Number(req.body[field]);
          } else {
            updates[field] = null; // Unset the field if empty
          }
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    if (updates.skills !== undefined) {
      updates.skills = Array.isArray(updates.skills) 
        ? updates.skills 
        : typeof updates.skills === 'string' ? updates.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
    }

    if (updates.techStack !== undefined) {
      updates.techStack = Array.isArray(updates.techStack) 
        ? updates.techStack 
        : typeof updates.techStack === 'string' ? updates.techStack.split(",").map(t => t.trim()).filter(Boolean) : [];
    }

    if (req.files) {
      if (req.files['resume'] && req.files['resume'][0]) {
        updates.resumeUrl = `/uploads/${req.files['resume'][0].filename}`;
      }
      if (req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
        updates.profilePhoto = `/uploads/${req.files['profilePhoto'][0].filename}`;
      }
    } else if (req.file) {
      if (req.file.fieldname === 'resume') updates.resumeUrl = `/uploads/${req.file.filename}`;
      if (req.file.fieldname === 'profilePhoto') updates.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      profile
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};