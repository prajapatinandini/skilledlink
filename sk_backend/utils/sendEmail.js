require("dotenv").config();
const nodemailer = require("nodemailer");

// 🚀 Optimized Transporter (Pooling removed for stability on Render)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // 587 ke liye false hi rahega
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
  // ⏱️ Timeout settings badha di hain
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false
  }
});

const SENDER_EMAIL = "nandiniprajapati422@gmail.com";

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"SkillEdLink" <${SENDER_EMAIL}>`, 
      to,
      subject,
      text,
    });
    console.log(`✅ OTP Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Brevo OTP Email Error:", error.message);
  }
};

const sendStatusEmail = async (to, studentName, status, companyName) => {
  try {
    const currentStatus = status ? status.toLowerCase().trim() : "";
    let subject = "";
    let htmlContent = "";

    if (currentStatus === "hired") {
      subject = `Congratulations! You are shortlisted at ${companyName} 🎉`;
      htmlContent = `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2d1f6e;">Hello ${studentName},</h2>
          <p>You have been <strong>SELECTED</strong> for the position at <strong>${companyName}</strong>.</p>
          <p>The HR team will contact you shortly.</p>
          <p>Best Regards,<br>SkilledLink Team</p>
      </div>`;
    } else if (currentStatus === "rejected") {
      subject = `Update on your application at ${companyName}`;
      htmlContent = `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2d1f6e;">Hello ${studentName},</h2>
          <p>We regret to inform you that we are not moving forward with your application at <strong>${companyName}</strong>.</p>
          <p>Best Regards,<br>SkilledLink Team</p>
      </div>`;
    } else { return; }

    await transporter.sendMail({
      from: `"SkilledLink" <${SENDER_EMAIL}>`, 
      to: to,
      subject: subject,
      html: htmlContent,
    });
    
    console.log(`🚀 Status Email (${status}) sent successfully!`);
  } catch (error) {
    console.error("❌ Brevo Status Email Error:", error.message);
  }
};

module.exports = { sendEmail, sendStatusEmail };