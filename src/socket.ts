import io from "socket.io-client";

export const socket = io("ws://10.0.0.18:5000", {
  transports: ["websocket"],
});
