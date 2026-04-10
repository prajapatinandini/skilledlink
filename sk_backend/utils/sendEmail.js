require("dotenv").config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525, 
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
  
  connectionTimeout: 10000, 
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
      htmlContent = `
        <div style="font-family: sans-serif; padding: 25px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #2d1f6e;">Hello ${studentName},</h2>
            <p>You have been successfully <strong>SELECTED</strong> for the position at <strong>${companyName}</strong>.</p>
            <p>Our team will contact you shortly.</p>
            <br/>
            <p>Best Regards,<br/><strong>SkilledLink Team</strong></p>
        </div>`;
    } else if (currentStatus === "rejected") {
      subject = `Update on your application at ${companyName}`;
      htmlContent = `
        <div style="font-family: sans-serif; padding: 25px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #2d1f6e;">Hello ${studentName},</h2>
            <p>After careful consideration, we regret to inform you that we are not moving forward with your application at <strong>${companyName}</strong>.</p>
            <p>We wish you the best for your future.</p>
            <br/>
            <p>Best Regards,<br/><strong>SkilledLink Team</strong></p>
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