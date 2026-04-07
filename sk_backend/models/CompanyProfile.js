const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  companyName: {
    type: String,
    required: true
  },

  website: String,
  industry: String,
  description: String,
  location: String,
  logo: String,

  companySize: {
  type: Number,
  min: 1,        // minimum 1 employee
  max: 10000     // maximum 10,000 employees
},

  hrName: String,
  hrEmail: String,
  hrPhone: String,

  hiringRoles: [String],

  isApproved: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("CompanyProfile", companySchema);