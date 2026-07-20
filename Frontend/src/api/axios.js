import axios from "axios";

// Single shared axios instance used everywhere in the app.
// Base URL can be overridden with VITE_API_URL in a .env file
// (falls back to the local FastAPI dev server).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// In-memory only. Deliberately NOT localStorage/sessionStorage - the
// access token lives only for the current browser tab session, so a
// full page reload will require logging in again.
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const getAuthToken = () => authToken;

export default api;
