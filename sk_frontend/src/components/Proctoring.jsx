import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Proctoring = ({ onCheatWarning, maxWarnings = 2 }) => { 
  const videoRef = useRef(null);
  
  // UI States
  const [status, setStatus] = useState("Initializing Models...");
  const [isViolation, setIsViolation] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  // Refs for tracking values inside setInterval
  const violationCountRef = useRef(0); 
  const warningsRef = useRef(0); 
  const intervalRef = useRef(null);

  // ================= 1. MODEL LOADING & CAMERA =================
  useEffect(() => {
    let streamRef = null;

    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        // ✅ 3 Models required for Production level Face + Pose tracking
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        startVideo();
      } catch (error) {
        setStatus("Model Load Error. Check Models folder.");
        console.error("FaceAPI Load Error:", error);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then((stream) => { 
          streamRef = stream; 
          if (videoRef.current) {
            videoRef.current.srcObject = stream; 
          }
        })
        .catch((err) => {
          setStatus("Camera Permission Denied!");
          handleViolation("Camera Blocked/Disconnected");
        });
    };

    loadModels();

    // 🧹 CLEANUP FUNCTION
    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

 // ================= 2. ADVANCED DETECTION INTERVAL (WITH GRACE PERIOD) =================
  const startDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // ⏳ 5 Second ka Grace Period
    setStatus("Camera Warming up... Look Straight");
    let isGracePeriod = true;
    
    setTimeout(() => {
      isGracePeriod = false;
      setStatus("System Secure");
    }, 5000);

    // 800ms interval for smooth tracking
    intervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && isModelLoaded) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          ).withFaceLandmarks();

          // 🚨 AGAR GRACE PERIOD CHAL RAHA HAI, TOH WARNING MAT DO
          if (isGracePeriod) return;

          let currentFrameViolation = null;

          if (detections.length === 0) {
            currentFrameViolation = "Face Not Detected";
          } else if (detections.length > 1) {
            currentFrameViolation = "Multiple People Detected";
          } else {
            // HEAD POSE CALCULATION
            const landmarks = detections[0].landmarks.positions;
            const leftCheek = landmarks[0]; 
            const rightCheek = landmarks[16]; 
            const noseTip = landmarks[30]; 

            const leftDistance = noseTip.x - leftCheek.x;
            const rightDistance = rightCheek.x - noseTip.x;
            const faceRatio = leftDistance / rightDistance;

            if (faceRatio > 2.2 || faceRatio < 0.45) {
              currentFrameViolation = "Looking Away from Screen";
            }
          }

          // BUFFER LOGIC
          if (currentFrameViolation) {
            violationCountRef.current += 1;
            if (violationCountRef.current >= 3) {
              handleViolation(currentFrameViolation);
              violationCountRef.current = 0; 
            }
          } else {
            if (violationCountRef.current > 0) violationCountRef.current -= 1; 
            setIsViolation(false);
            setStatus("System Secure");
          }

        } catch (error) {
          console.warn("Frame skipped");
        }
      }
    }, 800); 
  };

  // ================= 4. WARNING LOGIC =================
  const handleViolation = (reason) => {
    setIsViolation(true);
    setStatus(reason);
    warningsRef.current += 1;
    
    if (onCheatWarning) {
      onCheatWarning(warningsRef.current, reason);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.videoBox, borderColor: isViolation ? "#ff4d4f" : "#52c41a" }}>
        {/* onPlay triggers the interval only when video is fully ready */}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          onPlay={startDetection} 
          style={styles.video} 
        />
        <div style={styles.badge}>🔴 LIVE</div>
      </div>
      <div style={{ ...styles.status, color: isViolation ? "#ff4d4f" : "#52c41a" }}>
        {isViolation ? "⚠️ " : "🛡️ "} {status}
      </div>
    </div>
  );
};

const styles = {
  container: { position: "fixed", bottom: "30px", right: "30px", zIndex: 9999, textAlign: "center", fontFamily: "sans-serif" },
  videoBox: { width: "160px", height: "120px", borderRadius: "12px", overflow: "hidden", border: "4px solid", background: "#111", position: "relative", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  badge: { position: "absolute", top: "8px", right: "8px", background: "rgba(220, 38, 38, 0.9)", color: "white", fontSize: "10px", fontWeight: "bold", padding: "3px 6px", borderRadius: "6px", letterSpacing: "0.5px" },
  status: { marginTop: "8px", fontSize: "13px", fontWeight: "700", background: "white", padding: "6px 12px", borderRadius: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
};

export default Proctoring;