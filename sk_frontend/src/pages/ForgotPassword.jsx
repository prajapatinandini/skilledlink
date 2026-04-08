import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; 

const API_URL = "https://skilledlink-f4lp.onrender.com";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 SMART LOGIC: Pata lagayenge ki user kis login page se aaya hai. Default 'student' rakha hai.
  const userType = location.state?.role || 'student'; 
  const loginUrl = `/login/${userType}`;

  

  // ==========================================
  // STEP 1: SEND OTP
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message || "OTP sent to your email!");
      setStep(2); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. User not found.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY OTP
  // ==========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-reset-otp`, { email, otp });
      setMessage(res.data.message || "OTP verified! Please set a new password.");
      setStep(3); 
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 3: RESET PASSWORD
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { email, newPassword });
      alert(res.data.message || `Password reset successful! Redirecting to ${userType} login...`);
      
      // 🚀 YAHAN DYNAMIC REDIRECT HOGA (Student hai toh /login/student, Company hai toh /login/company)
      navigate(loginUrl); 

    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <div style={{ flex: 1, backgroundColor: '#553f9a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ fontSize: '100px', marginBottom: '20px' }}>👩‍💻</div> 
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0 }}>SkilledLink</h1>
        <p style={{ fontSize: '18px', marginTop: '10px', opacity: 0.8 }}>Recover your account</p>
      </div>

      <div style={{ flex: 1, backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          
          <h2 style={{ color: '#553f9a', margin: '0 0 10px 0', fontSize: '24px' }}>Forgot Password</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            {step === 1 && "Enter your registered email address"}
            {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
            {step === 3 && "Create a new strong password"}
          </p>

          {error && <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          {message && <div style={{ color: '#16a34a', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>{message}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#553f9a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.2s' }}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', letterSpacing: '2px', textAlign: 'center' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#553f9a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#553f9a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div style={{ marginTop: '24px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#6b7280' }}>Remembered your password? </span>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <span onClick={() => navigate(loginUrl)} style={{ color: '#553f9a', fontWeight: 'bold', cursor: 'pointer' }}>
                Back to {userType === 'student' ? 'Student' : 'Company'} Login
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;