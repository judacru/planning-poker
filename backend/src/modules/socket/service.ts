import { Server, Socket } from "socket.io";
import { verifyToken } from "../../utils/jwt.js";
import {
  ParticipantJoinedEvent,
  ParticipantLeftEvent,
  GameDeletedEvent,
  RoundCreatedEvent,
  RoundRevealedEvent,
} from "./events.js";

export class SocketService {
  // Map of socket.io connections to user data
  private userSockets: Map<string, { userId: string; nickname: string; gameId?: string }> =
    new Map();

  // Map of users connected to each game
  private gameUsers: Map<string, Set<string>> = new Map();

  constructor(private io: Server) {
    this.setupConnectionHandlers();
  }

  /**
   * Setup WebSocket connection and event handlers
   */
  private setupConnectionHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`[WS] Client connected: ${socket.id}`);

      // Handle user identification (after auth)
      socket.on("identify", (data: { token: string; gameId?: string }) => {
        this.handleIdentify(socket, data);
      });

      // Game events
      socket.on("game:join", (data: { gameId: string }) => {
        this.handleGameJoin(socket, data);
      });

      socket.on("game:leave", (data: { gameId: string }) => {
        this.handleGameLeave(socket, data);
      });

      // Round events
      socket.on("round:create", (data: { gameId: string; ticketName: string }) => {
        this.handleRoundCreate(socket, data);
      });

      socket.on("round:reveal", (data: { gameId: string; roundId: string }) => {
        this.handleRoundReveal(socket, data);
      });

      // Vote events
      socket.on("vote:submit", (data: { gameId: string; roundId: string; value: number }) => {
        this.handleVoteSubmit(socket, data);
      });

      // Disconnect
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Identify user and validate JWT token
   */
  private handleIdentify(socket: Socket, data: { token: string; gameId?: string }) {
    try {
      const decoded = verifyToken(data.token);

      if (!decoded.userId) {
        socket.emit("error", { message: "Invalid token" });
        return;
      }

      // Store user info
      this.userSockets.set(socket.id, {
        userId: decoded.userId,
        nickname: decoded.nickname || "Guest",
        gameId: data.gameId,
      });

      console.log(`[WS] User identified: ${decoded.nickname} (${socket.id})`);
      socket.emit("identified", { userId: decoded.userId, nickname: decoded.nickname });
    } catch (error) {
      console.error("[WS] Token verification failed:", error);
      socket.emit("error", { message: "Authentication failed" });
    }
  }

  /**
   * Handle user joining a game
   */
  private handleGameJoin(socket: Socket, data: { gameId: string }) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    // Join socket.io room
    socket.join(`game:${data.gameId}`);
    userInfo.gameId = data.gameId;

    // Track user in game
    if (!this.gameUsers.has(data.gameId)) {
      this.gameUsers.set(data.gameId, new Set());
    }
    this.gameUsers.get(data.gameId)!.add(socket.id);

    // Broadcast participant joined
    const event: ParticipantJoinedEvent = {
      gameId: data.gameId,
      userId: userInfo.userId,
      userNickname: userInfo.nickname,
      participantCount: this.gameUsers.get(data.gameId)?.size || 0,
    };

    this.io.to(`game:${data.gameId}`).emit("participant:joined", event);
    console.log(
      `[WS] ${userInfo.nickname} joined game ${data.gameId}. Active: ${event.participantCount}`
    );
  }

  /**
   * Handle user leaving a game
   */
  private handleGameLeave(socket: Socket, data: { gameId: string }) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) return;

    socket.leave(`game:${data.gameId}`);

    // Remove user from game tracking
    const gameUsers = this.gameUsers.get(data.gameId);
    if (gameUsers) {
      gameUsers.delete(socket.id);
    }

    // Broadcast participant left
    const event: ParticipantLeftEvent = {
      gameId: data.gameId,
      userId: userInfo.userId,
      userNickname: userInfo.nickname,
      participantCount: gameUsers?.size || 0,
    };

    this.io.to(`game:${data.gameId}`).emit("participant:left", event);
    console.log(
      `[WS] ${userInfo.nickname} left game ${data.gameId}. Active: ${event.participantCount}`
    );
  }

  /**
   * Handle round creation
   */
  private handleRoundCreate(socket: Socket, data: { gameId: string; ticketName: string }) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    const event: RoundCreatedEvent = {
      gameId: data.gameId,
      roundId: `round-${Date.now()}`, // Temporary - will be replaced with DB ID
      ticketName: data.ticketName,
      ticketNumber: 1,
    };

    // Broadcast to game room
    this.io.to(`game:${data.gameId}`).emit("round:created", event);
    console.log(`[WS] Round created in game ${data.gameId}: ${data.ticketName}`);
  }

  /**
   * Handle round reveal
   */
  private handleRoundReveal(socket: Socket, data: { gameId: string; roundId: string }) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    // In real implementation, this would fetch votes from DB
    const event: RoundRevealedEvent = {
      gameId: data.gameId,
      roundId: data.roundId,
      votes: [],
      average: 0,
    };

    this.io.to(`game:${data.gameId}`).emit("round:revealed", event);
    console.log(`[WS] Round revealed in game ${data.gameId}`);
  }

  /**
   * Handle vote submission
   */
  private handleVoteSubmit(
    socket: Socket,
    data: { gameId: string; roundId: string; value: number }
  ) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    // Broadcast to game room (except the value until reveal)
    this.io.to(`game:${data.gameId}`).emit("vote:submitted", {
      gameId: data.gameId,
      roundId: data.roundId,
      userId: userInfo.userId,
      userNickname: userInfo.nickname,
    });

    console.log(`[WS] Vote submitted by ${userInfo.nickname}: ${data.value}`);
  }

  /**
   * Handle user disconnect
   */
  private handleDisconnect(socket: Socket) {
    const userInfo = this.userSockets.get(socket.id);

    if (userInfo && userInfo.gameId) {
      this.handleGameLeave(socket, { gameId: userInfo.gameId });
    }

    this.userSockets.delete(socket.id);
    console.log(`[WS] Client disconnected: ${socket.id}`);
  }

  /**
   * Get active users in a game
   */
  getGameUsers(gameId: string): number {
    return this.gameUsers.get(gameId)?.size || 0;
  }

  /**
   * Notify game of participant joined
   */
  notifyParticipantJoined(event: ParticipantJoinedEvent) {
    this.io.to(`game:${event.gameId}`).emit("participant:joined", event);
  }

  /**
   * Notify game of participant left
   */
  notifyParticipantLeft(event: ParticipantLeftEvent) {
    this.io.to(`game:${event.gameId}`).emit("participant:left", event);
  }

  /**
   * Broadcast game deleted to all participants
   */
  notifyGameDeleted(gameId: string) {
    const event: GameDeletedEvent = { gameId };
    this.io.to(`game:${gameId}`).emit("game:deleted", event);

    // Disconnect all users from this game
    const gameUsers = this.gameUsers.get(gameId);
    if (gameUsers) {
      gameUsers.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(`game:${gameId}`);
        }
      });
      this.gameUsers.delete(gameId);
    }
  }

  /**
   * Get Socket.io instance
   */
  getIO(): Server {
    return this.io;
  }
}
