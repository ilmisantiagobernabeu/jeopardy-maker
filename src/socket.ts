import io from "socket.io-client";

export const socket = io("ws://10.0.0.208:5000", {
  transports: ["websocket"],
});
