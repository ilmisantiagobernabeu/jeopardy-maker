export const SERVER_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://jeopardy-backend.onrender.com";

export const SOCKET_SERVER_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://jeopardy-backend.onrender.com";
