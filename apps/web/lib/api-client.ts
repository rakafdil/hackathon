import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Enable sending cookies with requests
});

// Note: Authentication is handled via httpOnly cookies
// No need for manual token management in interceptors

export default api;