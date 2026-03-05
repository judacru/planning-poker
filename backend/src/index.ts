import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import authRoutes from "./modules/auth/routes.js";
import gameRoutes from "./modules/game/routes.js";
import { SocketService } from "./modules/socket/service.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

// WebSocket service initialization
const socketService = new SocketService(io);

// Make socketService available globally for REST endpoints that need to broadcast
(global as any).socketService = socketService;

// Start server
const PORT = process.env.BACKEND_PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ WebSocket listening on ws://localhost:${PORT}`);
});
