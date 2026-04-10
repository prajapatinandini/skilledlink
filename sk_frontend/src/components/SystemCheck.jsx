import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SystemCheck = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams(); // URL se attempt ID nikalenge
  
  const [permissionStatus, setPermissionStatus] = useState("idle"); // idle, checking, granted, denied
  const [errorMessage, setErrorMessage] = useState("");

  const requestPermissions = async () => {
    setPermissionStatus("checking");
    setErrorMessage("");

    try {
      // 1. Browser se Camera aur Mic dono ki permission maango
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      // 2. Agar yahan tak code aaya, matlab permission mil gayi!
      setPermissionStatus("granted");

      // 🚀 THE MASTERSTROKE: Permission milte hi stream ko turant STOP kar do.
      // Isse camera ki light band ho jayegi taaki actual test page bina error ke dobara camera access kar sake.
      stream.getTracks().forEach(track => track.stop());

    } catch (error) {
      console.error("Permission Error:", error);
      setPermissionStatus("denied");
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setErrorMessage("Permission denied. Please click the lock icon 🔒 in your browser address bar and allow Camera & Microphone.");
      } else if (error.name === "NotFoundError") {
        setErrorMessage("No camera or microphone found on your device.");
      } else {
        setErrorMessage("Could not access camera. Please close other apps using it and try again.");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8faff", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", width: "100%", background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#2d1f6e", margin: "0 0 10px 0" }}>System Readiness Check</h1>
          <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.6" }}>
            This assessment is AI-Proctored. We need to verify that your webcam and microphone are working correctly before you begin.
          </p>
        </div>

        <div style={{ background: "#f3f0ff", padding: "20px", borderRadius: "12px", border: "1px solid #ede8fb", marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <span style={{ fontWeight: "bold", color: "#553f9a", fontSize: "16px" }}>📷 Camera & Microphone</span>
            
            {permissionStatus === "idle" && <span style={{ color: "#888", fontWeight: "bold" }}>Pending</span>}
            {permissionStatus === "checking" && <span style={{ color: "#f59e0b", fontWeight: "bold" }}>Checking... ⏳</span>}
            {permissionStatus === "granted" && <span style={{ color: "#16a34a", fontWeight: "bold", background: "#dcfce7", padding: "4px 10px", borderRadius: "20px", fontSize: "13px" }}>Passed ✅</span>}
            {permissionStatus === "denied" && <span style={{ color: "#dc2626", fontWeight: "bold", background: "#fee2e2", padding: "4px 10px", borderRadius: "20px", fontSize: "13px" }}>Failed ❌</span>}
          </div>

          {permissionStatus === "denied" && (
            <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "10px", padding: "10px", background: "#fef2f2", borderRadius: "8px" }}>
              {errorMessage}
            </p>
          )}

          {(permissionStatus === "idle" || permissionStatus === "denied") && (
            <button 
              onClick={requestPermissions}
              style={{ width: "100%", padding: "12px", background: "white", color: "#553f9a", border: "2px solid #553f9a", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", transition: "0.2s" }}
            >
              Click to Allow Permissions
            </button>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <button 
            disabled={permissionStatus !== "granted"}
            onClick={() => navigate(`/assessment/${attemptId}`)} // 👈 Actual test page ka URL
            style={{
              width: "100%",
              padding: "16px",
              background: permissionStatus === "granted" ? "linear-gradient(135deg,#553f9a,#7b5fc4)" : "#e5e7eb",
              color: permissionStatus === "granted" ? "white" : "#9ca3af",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: permissionStatus === "granted" ? "pointer" : "not-allowed",
              boxShadow: permissionStatus === "granted" ? "0 4px 15px rgba(85,63,154,0.3)" : "none",
              transition: "0.3s"
            }}
          >
            Start Assessment 🚀
          </button>
          <p style={{ color: "#999", fontSize: "12px", marginTop: "15px" }}>
            *Your timer will start only after you click this button.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SystemCheck;