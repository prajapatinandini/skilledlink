import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Pages
import StudentLogin from "./pages/StudentLogin";
import CompanyLogin from "./pages/CompanyLogin";
import StudentRegister from "./pages/StudentRegister";
import CompanyRegister from "./pages/CompanyRegister";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";

// Core Pages
import LandingPage from "./pages/LandingPage";
import Quiz from "./pages/Quiz";

// 🚀 SystemCheck component folder se aayega
import SystemCheck from "./components/SystemCheck"; 

// Student Pages
import StudentPage from "./pages/StudentPage";
import StudentProfile from "./pages/StudentProfile";

// 🚀 Assessement pages folder se aayega
import Assessement from "./pages/Assessement"; 

// Company Pages
import CompanyProfileCreate from "./pages/CompanyProfileCreate";

// Dashboards
import Dashboard from "./pages/Dashboard";
import CompanyDashboard from "./CompanyDashboard";

import SuperAdminDashboard from "./pages/SuperAdminDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/company" element={<CompanyLogin />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/company" element={<CompanyRegister />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Student Flow */}
        <Route path="/student" element={<StudentPage />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/quiz" element={<Quiz />} />
        
        {/* 🚀 System Check Flow */}
        <Route path="/system-check/:testId" element={<SystemCheck />} />
        <Route path="/assessment/:testId" element={<Assessement />} /> 

        {/* Company Flow */}
        <Route path="/company/create-profile" element={<CompanyProfileCreate />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />  
        <Route path="/system-core-admin-99x" element={<SuperAdminDashboard />} />
        

        {/* Optional / Legacy Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;