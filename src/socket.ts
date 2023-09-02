import io from "socket.io-client";

export const socket = io("ws://192.168.0.18:5000", {
  transports: ["websocket"],
});
