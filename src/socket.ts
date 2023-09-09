import io from "socket.io-client";

export const socket = io(`ws://${import.meta.env.VITE_STATIC_IP}:5000`, {
  transports: ["websocket"],
});
