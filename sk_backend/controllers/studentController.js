// controllers/studentController.js
const CompanyProfile = require("../models/CompanyProfile"); // Apna actual model path check kar lein

exports.getAllCompanies = async (req, res) => {
  try {
    // Database se saari companies fetch karein
    // Aap .select() ka use karke sirf zaroori fields hi bhej sakte hain
    const companies = await CompanyProfile.find({})
      .select("companyName name industry location package logo about hiringRoles requirements testType hrName hrEmail");

    // Frontend par 'companies' array bhej dein
    res.status(200).json({
      success: true,
      companies: companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error while fetching companies." });
  }
};

