import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";

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
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// API Routes (to be implemented)
app.use("/api/auth", (req, res) => {
  res.json({ message: "Auth routes coming soon" });
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join_game", (data) => {
    console.log(`User joined game: ${data.gameId}`);
    socket.join(`game:${data.gameId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.BACKEND_PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ WebSocket listening on ws://localhost:${PORT}`);
});
