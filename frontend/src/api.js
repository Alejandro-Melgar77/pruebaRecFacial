import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/auth", // 👈 importante el /api/auth
});

// ahora estos endpoints son relativos al baseURL
export const register = (data) => API.post("/register/", data);
export const login = (data) => API.post("/login/", data);
