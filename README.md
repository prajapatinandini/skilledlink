# SkillEdLink – Skill-Based Hiring Platform (SaaS Model)

SkillEdLink is a modern ATS (Applicant Tracking System) designed to bridge the gap between skilled candidates and recruiters using an AI-driven assessment and credit-based system.

## 🚀 Features

### For Students
- **Credit-Based Application:** Deducts 10 credits per job application.
- **AI Proctoring:** Integrated coding sandbox with test-case validation.
- **Multi-Stage Assessment:** Includes Aptitude (MCQs) and Coding challenges.
- **GitHub Integration:** Submit project URLs for automated evaluation.

### For Companies (HR)
- **Job Management:** Create, pause, or close job listings.
- **Real-Time Analytics:** View student scores and coding performance.
- **Profile Management:** Detailed company branding and HR contact info.

### For Super Admin (Founder)
- **Centralized Dashboard:** Monitor all registered companies.
- **Credit Management:** Manually assign/sell credits to companies.
- **System Control:** High-level overview of platform growth.

## 🛠️ Tech Stack
- **Frontend:** React.js, Axios, React-Router-DOM
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Security:** JWT Authentication, VM2 Sandbox (for code execution)
- **Deployment:** Render (Backend), Vercel (Frontend)

## 📁 Project Structure
```bash
├── backend
│   ├── controllers    # Logic for Admin, Jobs, Tests
│   ├── models         # User, Job, TestAttempt, CompanyProfile schemas
│   └── routes         # API Endpoints
└── frontend
    ├── src/components # Reusable UI components
    └── src/pages      # Dashboards (Student, HR, SuperAdmin)
