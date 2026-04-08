require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Common Sender Email (Ise ek hi jagah define kar dete hain)
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
    console.error("❌ Brevo OTP Email Error:", error);
  }
};

const sendStatusEmail = async (to, studentName, status, companyName) => {
  try {
    let subject = "";
    let htmlContent = "";
    
    // ✅ Convert status to lowercase to avoid case-sensitivity issues
    const currentStatus = status.toLowerCase();

    if (currentStatus === "hired") {
      subject = `Congratulations! You are Hired at ${companyName} 🎉`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #16a34a;">Hello ${studentName},</h2>
            <p>Great news! You have been successfully <strong style="color: #16a34a; font-size: 18px;">HIRED</strong> for the position at <strong>${companyName}</strong>.</p>
            <p>The HR team will contact you shortly with further onboarding details.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>SkilledLink Team</strong></p>
        </div>
      `;
    } 
    else if (currentStatus === "rejected") {
      subject = `Update on your application at ${companyName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
            <h2>Hello ${studentName},</h2>
            <p>Thank you for applying at <strong>${companyName}</strong>. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
            <p>Keep learning and applying. We wish you the best for your future endeavors!</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>SkilledLink Team</strong></p>
        </div>
      `;
    } 
    else {
        console.log("⚠️ Invalid Status received:", status);
        return; 
    }

    await transporter.sendMail({
      from: `"SkilledLink" <${SENDER_EMAIL}>`, // ✅ Fixed: Using hardcoded email to match OTP function
      to: to,
      subject: subject,
      html: htmlContent,
    });
    
    console.log(`🚀 Status Email (${status}) sent successfully to ${to}!`);
  } catch (error) {
    console.error("❌ Brevo Status Email Error:", error);
  }
};

module.exports = { sendEmail, sendStatusEmail };