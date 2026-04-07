import axios from "axios";

// Ye line apne aap pehchan legi ki hum Render par hain ya Localhost par
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_URL,
});

export default API;