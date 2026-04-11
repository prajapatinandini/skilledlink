const CompanyProfile = require("../models/CompanyProfile"); // Naya model import karo
const User = require("../models/User");

// ================= GET ALL COMPANIES (Joining two tables) =================
exports.getAllCompanies = async (req, res) => {
  try {
    // 🚀 Logic: Hum CompanyProfile se sara data uthayenge
    // Aur 'owner' field ko 'populate' karenge User model se taaki Credits mil jayein
    const companies = await CompanyProfile.find()
      .populate("owner", "credits email") // User table se credits aur email uthao
      .sort({ createdAt: -1 });

    // Frontend ko data bhejte waqt credits ko top-level par daal dete hain taaki purana code na tute
    const formattedData = companies.map(comp => ({
      ...comp._doc,
      credits: comp.owner ? comp.owner.credits : 0, // Owner se credits nikal lo
      email: comp.hrEmail || (comp.owner ? comp.owner.email : "N/A") // Priority to HR Email
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD CREDITS TO COMPANY =================
exports.addCredits = async (req, res) => {
  try {
    const { companyId, creditsToAdd } = req.body;

    // Yahan companyId ab CompanyProfile ki ID hogi
    const profile = await CompanyProfile.findById(companyId);
    if (!profile) return res.status(404).json({ message: "Company Profile not found!" });

    // Credits User model mein hain, toh owner ki ID use karke wahan update karo
    const user = await User.findById(profile.owner);
    if (!user) return res.status(404).json({ message: "Owner user not found!" });

    user.credits = (user.credits || 0) + Number(creditsToAdd);
    await user.save();

    res.status(200).json({ 
      message: `${creditsToAdd} Credits added successfully! 🪙`, 
      updatedCredits: user.credits 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};