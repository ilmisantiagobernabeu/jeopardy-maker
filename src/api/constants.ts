export const SOCKET_SERVER_URL =
  process.env.NODE_ENV === "development"
    ? `${import.meta.env.VITE_STATIC_IP}:5000`
    : "https://jeopardy-backend.onrender.com";

export const apiUrl =
  import.meta.env.VITE_API_BASE_URL || "http://10.0.0.208:5000";
