import { Server } from "socket.io";
import { httpServer } from "./httpServer";

// Start the websocket server
export const io = new Server(httpServer, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
  pingInterval: 10000,
  pingTimeout: 300000,
});
