import expressApp from "./server";
import http from "http";

export const httpServer = http.createServer(expressApp);
