import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Proctoring = ({ onCheatWarning, maxWarnings = 3 }) => { 
  const videoRef = useRef(null);
  
  // UI States
  const [status, setStatus] = useState("Initializing Models...");
  const [isViolation, setIsViolation] = useState(false);
  const [isReady, setIsReady] = useState(false); // Ye true tab hoga jab camera & models set ho jayenge
  
  // Refs for tracking values inside setInterval
  const violationCountRef = useRef(0); 
  const warningsRef = useRef(0); 
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const pcmDataRef = useRef(null);
  const streamRef = useRef(null);
  const isGracePeriodRef = useRef(true); // Grace period tracker

  // ================= 1. MODEL LOADING & CAMERA + AUDIO =================
  useEffect(() => {
    const loadModelsAndStart = async () => {
      try {
        const MODEL_URL = "/models"; // public/models folder mein files honi chahiye
        
        // 1. Load AI Models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        
        // 2. Request Camera AND Microphone
        setStatus("Requesting Permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: true });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream; 
        }

        // 3. Set up Audio Analyzer (For Noise/Talking Detection)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const pcmData = new Float32Array(analyser.frequencyBinCount);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        pcmDataRef.current = pcmData;

        setIsReady(true); // Sab kuch allow ho gaya!

      } catch (error) {
        if (error.name === "NotAllowedError") {
          setStatus("Camera/Mic Blocked! Please allow permissions.");
          handleViolation("Camera/Microphone Permission Denied");
        } else {
          setStatus("System Error. Please refresh.");
          console.error("Proctoring Setup Error:", error);
        }
      }
    };

    loadModelsAndStart();

    // 🧹 CLEANUP FUNCTION
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ================= 2. TAB SWITCH DETECTION (CENTRALIZED) =================
  useEffect(() => {
    // 🚀 FIX: Tab switch tab tak track mat karo jab tak Camera on hoke Ready na ho jaye
    if (!isReady) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Agar grace period nahi chal raha tabhi warning do
        if (!isGracePeriodRef.current) {
          handleViolation("Tab Switched or Minimized");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isReady]);


  // ================= 3. ADVANCED AI DETECTION INTERVAL =================
  const startDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // ⏳ 5 Second ka Grace Period
    setStatus("Camera Warming up... Please look straight.");
    isGracePeriodRef.current = true;
    
    setTimeout(() => {
      isGracePeriodRef.current = false;
      setStatus("System Secure & Monitoring");
    }, 5000);

    // 800ms interval for smooth tracking
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4 || !isReady) return;

      try {
        let currentFrameViolation = null;

        // --- A. AUDIO NOISE DETECTION ---
        if (analyserRef.current && pcmDataRef.current) {
          analyserRef.current.getFloatTimeDomainData(pcmDataRef.current);
          let sumSquares = 0.0;
          for (const amplitude of pcmDataRef.current) { sumSquares += amplitude * amplitude; }
          const volume = Math.sqrt(sumSquares / pcmDataRef.current.length);
          
          // Agar volume limit se zyada hai (adjust 0.15 as per sensitivity needed)
          if (volume > 0.15) {
            currentFrameViolation = "Background Noise / Talking Detected";
          }
        }

        // --- B. FACE & POSE DETECTION ---
        // Agar audio violation nahi hai, toh hi face check karo (optimizing performance)
        if (!currentFrameViolation) {
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            ).withFaceLandmarks();

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
        }

        // 🚨 AGAR GRACE PERIOD CHAL RAHA HAI, TOH LOGIC YAHIN ROK DO
        if (isGracePeriodRef.current) return;

        // --- C. BUFFER & WARNING LOGIC ---
        if (currentFrameViolation) {
          violationCountRef.current += 1;
          // 3 lagatar frames mein violation ho tabhi act karo
          if (violationCountRef.current >= 3) {
            handleViolation(currentFrameViolation);
            violationCountRef.current = 0; 
          }
        } else {
          if (violationCountRef.current > 0) violationCountRef.current -= 1; 
          setIsViolation(false);
          setStatus("System Secure & Monitoring");
        }

      } catch (error) {
        console.warn("Frame skipped in Proctoring");
      }
    }, 800); 
  };

  // ================= 4. WARNING HANDLER =================
  const handleViolation = (reason) => {
    setIsViolation(true);
    setStatus(reason);
    warningsRef.current += 1;
    
    // Parent component (AssessmentPage) ko batao ki warning aayi hai
    if (onCheatWarning) {
      onCheatWarning(warningsRef.current, reason);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.videoBox, borderColor: isViolation ? "#ff4d4f" : "#52c41a" }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          onPlay={startDetection} 
          style={{ ...styles.video, filter: isReady ? "none" : "blur(4px)" }} 
        />
        <div style={styles.badge}>
            {isGracePeriodRef.current ? "⏳ STARTING" : "🔴 LIVE AI"}
        </div>
      </div>
      <div style={{ ...styles.status, color: isViolation ? "#ff4d4f" : "#52c41a", border: `1px solid ${isViolation ? "#ff4d4f" : "#52c41a"}` }}>
        {isViolation ? "⚠️ " : "🛡️ "} {status}
      </div>
    </div>
  );
};

const styles = {
  container: { position: "fixed", bottom: "30px", right: "30px", zIndex: 9999, textAlign: "center", fontFamily: "sans-serif" },
  videoBox: { width: "160px", height: "120px", borderRadius: "12px", overflow: "hidden", border: "4px solid", background: "#111", position: "relative", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", transition: "0.3s" },
  badge: { position: "absolute", top: "8px", right: "8px", background: "rgba(220, 38, 38, 0.9)", color: "white", fontSize: "10px", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px", letterSpacing: "0.5px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  status: { marginTop: "10px", fontSize: "12px", fontWeight: "700", background: "white", padding: "8px 14px", borderRadius: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
};

export default Proctoring;