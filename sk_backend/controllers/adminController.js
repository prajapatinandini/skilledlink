const User = require("../models/User");

// ================= GET ALL COMPANIES =================
exports.getAllCompanies = async (req, res) => {
  try {
    // Hum sirf un users ko dhoondh rahe hain jinka role 'company' hai
    const companies = await User.find({ role: "company" }).select("-password"); // Password hide kar diya
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD CREDITS TO COMPANY =================
exports.addCredits = async (req, res) => {
  try {
    const { companyId, creditsToAdd } = req.body;

    const company = await User.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found!" });
    }

    // Credits add karo aur save karo
    company.credits = (company.credits || 0) + Number(creditsToAdd);
    await company.save();

    res.status(200).json({ 
      message: `${creditsToAdd} Credits added successfully! 🪙`, 
      updatedCredits: company.credits 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};