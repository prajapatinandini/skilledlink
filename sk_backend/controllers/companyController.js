const CompanyProfile = require("../models/CompanyProfile");
const CompanySettings = require("../models/CompanySettings");
const Subscription = require("../models/Subscription");
const AptitudeQuestion = require("../models/AptitudeQuestion");
const Test = require("../models/Test");
const Company = require("../models/User");
const Student = require("../models/StudentProfile");

exports.createCompanyProfile = async (req, res) => {
  try {
    const {
      companyName,
      website,
      industry,
      description,
      location,
      companySize,
      hrName,
      hrEmail,
      hrPhone,
      hiringRoles,
      allowedLanguages,
      evaluationFormula
    } = req.body;

    // 🕵️‍♂️ Check if already created
    const existingCompany = await CompanyProfile.findOne({ owner: req.user._id || req.user.id });

    // ==========================================
    // 🟢 AGAR PROFILE PEHLE SE HAI -> UPDATE KARO
    // ==========================================
    if (existingCompany) {
      const updatedCompany = await CompanyProfile.findOneAndUpdate(
        { owner: req.user._id || req.user.id },
        { 
          companyName, website, industry, description, location, 
          companySize, hrName, hrEmail, hrPhone, hiringRoles 
        },
        { new: true } // Return updated document
      );

      return res.json({ 
        message: "Profile updated successfully! ✨", 
        company: updatedCompany 
      });
    }

    // ==========================================
    // 🔵 AGAR NAYI PROFILE HAI -> CREATE KARO
    // ==========================================

    // Validate evaluation formula total = 100
    const total =
      (evaluationFormula?.aptitude || 0) +
      (evaluationFormula?.coding || 0) +
      (evaluationFormula?.github || 0);

    if (total !== 100) {
      return res.status(400).json({
        message: "Evaluation formula must total 100%"
      });
    }

    // 1️⃣ Create Company
    const company = await CompanyProfile.create({
      owner: req.user._id || req.user.id,
      companyName, website, industry, description, location,
      companySize, hrName, hrEmail, hrPhone, hiringRoles
    });

    // 2️⃣ Create Company Settings
    await CompanySettings.create({
      company: company._id,
      allowedLanguages,
      evaluationFormula
    });

    // 3️⃣ Create Free Subscription
    await Subscription.create({
      company: company._id,
      plan: "free",
      maxTestsAllowed: 3,
      maxStudentsPerTest: 100,
      isActive: true
    });

    res.status(201).json({
      message: "Company profile created successfully! 🎉",
      company
    });

  } catch (error) {
    console.error("Profile Save Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Company Profile
exports.getProfile = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ owner: req.user._id });

    if (!company) return res.status(404).json({ message: "Profile not found" });

    // Check if profile is complete
    const isProfileComplete =
      company.companyName &&
      company.industry &&
      company.location &&
      company.hrName &&
      company.hrEmail;

    res.json({
      companyName: company.companyName,
      website: company.website,
      industry: company.industry,
      description: company.description,
      location: company.location,
      companySize: company.companySize,
      hrName: company.hrName,
      hrEmail: company.hrEmail,
      hrPhone: company.hrPhone,
      hiringRoles: company.hiringRoles,
      isProfileComplete
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Company Profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const company = await CompanyProfile.findOneAndUpdate(
      { owner: req.user._id },
      updates,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json({ message: "Profile updated", company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tests for company
exports.getCompanyTests = async (req, res) => {
  try {
    const tests = await Test.find({ company: req.user._id });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get test stats (number of students, average score)
exports.getTestStats = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId).populate("students");

    if (!test) return res.status(404).json({ message: "Test not found" });

    const numStudents = test.students.length;
    let totalScores = 0;
    test.students.forEach(student => {
      const t = student.tests.find(t => t.test.toString() === testId);
      if (t) totalScores += t.totalScore;
    });

    const avgScore = numStudents ? (totalScores / numStudents) : 0;

    res.json({ numStudents, avgScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get students of a test
exports.getStudentsByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const students = await Student.find({ "tests.test": testId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single student details
exports.getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate("tests.test");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


