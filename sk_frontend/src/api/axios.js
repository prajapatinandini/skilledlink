import axios from "axios";

// Ye line apne aap pehchan legi ki hum Render par hain ya Localhost par

const API_URL = "https://skilledlink-f4lp.onrender.com";

const API = axios.create({
  baseURL: API_URL,
});

export default API;