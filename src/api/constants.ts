export const SOCKET_SERVER_URL =
  process.env.NODE_ENV === "development"
    ? `${import.meta.env.VITE_STATIC_IP}:5000`
    : "https://jeopardy-backend.onrender.com";
