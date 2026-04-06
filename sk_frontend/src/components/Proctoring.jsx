import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Proctoring = ({ onCheatWarning, maxWarnings = 2 }) => { 
  const videoRef = useRef(null);
  const [warnings, setWarnings] = useState(0);
  const [status, setStatus] = useState("System Active");
  const [isViolation, setIsViolation] = useState(false);
  const violationCountRef = useRef(0); // Tracking ke liye ref

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      startVideo();
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 300 } })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => setStatus("Camera Error"));
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        // 🚨 2 SECOND STRICT LOGIC
        if (detections.length === 0) {
          violationCountRef.current += 1;
          
          // Interval 1000ms ka hai, toh count 2 hone ka matlab exactly 2 seconds!
          if (violationCountRef.current >= 2) {
            handleViolation("Face Not Detected / Looking Away");
            violationCountRef.current = 0; // 👈 Warning dene ke baad counter reset taaki lagatar spam na ho
          }
        } else if (detections.length > 1) {
          handleViolation("Multiple People Detected");
          violationCountRef.current = 0; // 👈 Counter reset
        } else {
          // Sab theek hai toh turant counter reset kar do
          violationCountRef.current = 0;
          setIsViolation(false);
          setStatus("System Secure");
        }
      }
    }, 1000); // 👈 Interval thik 1 Second (1000ms) kar diya
    
    return () => clearInterval(interval);
  }, [warnings]);

  const handleViolation = (reason) => {
    setIsViolation(true);
    setStatus(reason);
    
    // Parent component (Assessment/Quiz) ko update bhej rahe hain
    setWarnings(prev => {
      const next = prev + 1;
      onCheatWarning(next, reason); 
      return next;
    });
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.videoBox, borderColor: isViolation ? "red" : "#553f9a" }}>
        <video ref={videoRef} autoPlay muted style={styles.video} />
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
  video: { width: "100%", height: "100%", objectFit: "cover" },
  badge: { position: "absolute", top: "5px", right: "5px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "10px", padding: "2px 5px", borderRadius: "4px" },
  status: { marginTop: "5px", fontSize: "12px", fontWeight: "bold", background: "white", padding: "2px 8px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }
};

export default Proctoring;