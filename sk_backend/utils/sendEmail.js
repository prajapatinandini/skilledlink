require("dotenv").config();
const nodemailer = require("nodemailer");

// 🚀 TRANSPORTER WITH POOLING: Optimized for speed and multiple recipients
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  pool: true, // Reuses the SMTP connection
  maxConnections: 5, // Concurrent connections
  maxMessages: 100, // Messages per connection
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Common Sender Email
const SENDER_EMAIL = "nandiniprajapati422@gmail.com";

/**
 * 1. OTP Email Function (Text-based for speed)
 */
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

/**
 * 2. Status Update Email Function (Professional HTML Templates)
 */
const sendStatusEmail = async (to, studentName, status, companyName) => {
  try {
    let subject = "";
    let htmlContent = "";
    
    // Safely format status
    const currentStatus = status ? status.toLowerCase().trim() : "";

    if (currentStatus === "hired") {
      subject = `Congratulations! You are shortlisted at ${companyName} 🎉`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #2d1f6e; margin-bottom: 20px;">Hello ${studentName},</h2>
            
            <p style="line-height: 1.6; font-size: 15px;">We have fantastic news! You have successfully cleared the assessments and have been <strong style="color: #16a34a; font-size: 16px;">SELECTED</strong> for the position at <strong>${companyName}</strong>.</p>
            
            <p style="line-height: 1.6; font-size: 15px;">The HR team from ${companyName} will reach out to you shortly via email or phone to discuss the next steps, including onboarding and role discussion.</p>
            
            <div style="background-color: #f3f0ff; padding: 15px; border-left: 4px solid #553f9a; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #2d1f6e;">⏳ Next Step:</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Keep your documents ready and stay reachable on your registered phone number/email.</p>
            </div>

            <p style="line-height: 1.6; font-size: 15px;">Congratulations once again on your brilliant performance!</p>
            
            <br/>
            <p style="margin: 0; font-size: 14px; color: #666;">Best Regards,</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #2d1f6e;">SkilledLink Team</p>
        </div>
      `;
    } 
    else if (currentStatus === "rejected") {
      subject = `Update on your application at ${companyName}`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #2d1f6e;">Hello ${studentName},</h2>
            <p style="line-height: 1.6; font-size: 15px;">Thank you for your interest and for applying at <strong>${companyName}</strong>. After careful consideration of your assessment results, we regret to inform you that we will not be moving forward with your application for this particular role.</p>
            <p style="line-height: 1.6; font-size: 15px;">Please don't let this dishearten you. We encourage you to keep polishing your skills and applying to other exciting opportunities on the SkilledLink platform.</p>
            <br/>
            <p style="margin: 0; font-size: 14px; color: #666;">Best Regards,</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #2d1f6e;">SkilledLink Team</p>
        </div>
      `;
    } 
    else {
        console.log("⚠️ Invalid Status received:", status);
        return; 
    }

    await transporter.sendMail({
      from: `"SkilledLink" <${SENDER_EMAIL}>`, 
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