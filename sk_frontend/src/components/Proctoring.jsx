import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Proctoring = ({ onCheatWarning, maxWarnings = 2 }) => { 
  const videoRef = useRef(null);
  
  // States for UI
  const [status, setStatus] = useState("Initializing...");
  const [isViolation, setIsViolation] = useState(false);
  
  // Refs for tracking values inside setInterval without stale closures
  const violationCountRef = useRef(0); 
  const warningsRef = useRef(0); // 👈 Naya Ref total warnings track karne ke liye

  // ================= 1. MODEL LOADING & CAMERA CLEANUP =================
  useEffect(() => {
    let streamRef = null;

    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        startVideo();
      } catch (error) {
        setStatus("Model Load Error");
        console.error("FaceAPI Load Error:", error);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: { width: 300 } })
        .then((stream) => { 
          streamRef = stream; // Reference save kiya taaki baad mein band kar sakein
          if (videoRef.current) videoRef.current.srcObject = stream; 
          setStatus("System Active");
        })
        .catch((err) => setStatus("Camera Permission Denied"));
    };

    loadModels();

    // 🧹 CLEANUP FUNCTION: Component hatne par Camera proper band hoga
    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ================= 2. DETECTION INTERVAL =================
  useEffect(() => {
    const interval = setInterval(async () => {
      // Check if video is playing and ready
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );

          // 🚨 2 SECOND STRICT LOGIC
          if (detections.length === 0) {
            violationCountRef.current += 1;
            
            if (violationCountRef.current >= 2) {
              handleViolation("Face Not Detected / Looking Away");
              violationCountRef.current = 0; 
            }
          } else if (detections.length > 1) {
            handleViolation("Multiple People Detected");
            violationCountRef.current = 0; 
          } else {
            // ✅ ALL GOOD
            violationCountRef.current = 0;
            setIsViolation(false);
            setStatus("System Secure");
          }
        } catch (error) {
          console.warn("Face detection frame skipped:", error);
        }
      }
    }, 1000); 
    
    // 👈 Dependency array empty rakhi hai taaki interval baare-baar reset na ho
    return () => clearInterval(interval);
  }, []);

  // ================= 3. WARNING LOGIC =================
  const handleViolation = (reason) => {
    setIsViolation(true);
    setStatus(reason);
    
    // Use Ref to get the latest count accurately without stale closure
    warningsRef.current += 1;
    
    // Function pure rakha hai
    if (onCheatWarning) {
      onCheatWarning(warningsRef.current, reason);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.videoBox, borderColor: isViolation ? "red" : "#553f9a" }}>
        <video ref={videoRef} autoPlay muted playsInline style={styles.video} />
        <div style={styles.badge}>🔴 LIVE</div>
      </div>
      <div style={{ ...styles.status, color: isViolation ? "red" : "green" }}>
        {isViolation ? "⚠️ " : "🛡️ "} {status}
      </div>
    </div>
  );
};

const styles = {
  container: { position: "fixed", bottom: "20px", right: "20px", zIndex: 5000, textAlign: "center" },
  videoBox: { width: "150px", height: "110px", borderRadius: "10px", overflow: "hidden", border: "3px solid", background: "#000", position: "relative" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }, // Mirror image ke liye scaleX(-1) zaroori hai
  badge: { position: "absolute", top: "5px", right: "5px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "10px", padding: "2px 5px", borderRadius: "4px" },
  status: { marginTop: "5px", fontSize: "12px", fontWeight: "bold", background: "white", padding: "2px 8px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }
};

export default Proctoring;