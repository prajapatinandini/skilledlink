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

// ✅ Common Sender Email 
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
    
    const currentStatus = status.toLowerCase();

    if (currentStatus === "hired") {
      // 🚀 UPDATE: Subject aur Email Body ko zyada realistic aur professional banaya hai
      subject = `Congratulations! You are shortlisted at ${companyName} 🎉`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #2d1f6e; margin-bottom: 20px;">Hello ${studentName},</h2>
            
            <p style="line-height: 1.6; font-size: 15px;">We have fantastic news for you! You have successfully cleared the assessments and have been <strong style="color: #16a34a; font-size: 16px;">SELECTED</strong> for the next phase at <strong>${companyName}</strong>.</p>
            
            <p style="line-height: 1.6; font-size: 15px;">As a final step, the leadership/HR team at <strong>${companyName}</strong> would like to schedule a brief concluding meeting with you. This discussion will focus on your role expectations, cultural fit, and onboarding process.</p>
            
            <div style="background-color: #f3f0ff; padding: 15px; border-left: 4px solid #553f9a; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #2d1f6e;">⏳ Next Steps:</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">The HR team will reach out to you shortly via email or phone to confirm the date, time, and link for this final meeting. Please keep an eye on your inbox.</p>
            </div>

            <p style="line-height: 1.6; font-size: 15px;">Congratulations once again on your brilliant performance! We are cheering for you.</p>
            
            <br/>
            <p style="margin: 0; font-size: 14px; color: #666;">Best Regards,</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #2d1f6e;">SkilledLink Team</p>
        </div>
      `;
    } 
    else if (currentStatus === "rejected") {
      subject = `Update on your application at ${companyName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: auto;">
            <h2 style="color: #2d1f6e;">Hello ${studentName},</h2>
            <p style="line-height: 1.6; font-size: 15px;">Thank you for your interest and for applying at <strong>${companyName}</strong>. After careful consideration of your assessment results, we regret to inform you that we will not be moving forward with your application for this particular role.</p>
            <p style="line-height: 1.6; font-size: 15px;">Please don't let this dishearten you. We encourage you to keep polishing your skills and applying to other exciting opportunities on the platform.</p>
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