import { Server, Socket } from "socket.io";
import { verifyToken } from "../../utils/jwt.js";
import {
  ParticipantJoinedEvent,
  ParticipantLeftEvent,
  GameDeletedEvent,
  RoundCreatedEvent,
  RoundRevealedEvent,
  VoteSubmittedEvent,
} from "./events.js";
import { GameRepository } from "../game/repository.js";
import { GameService } from "../game/service.js";

export class SocketService {
  // Map of socket.io connections to user data
  private userSockets: Map<string, { userId: string; nickname: string; gameId?: string }> =
    new Map();

  // Map of users connected to each game
  private gameUsers: Map<string, Set<string>> = new Map();

  private gameService: GameService;

  constructor(private io: Server) {
    const repository = new GameRepository();
    this.gameService = new GameService(repository);
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
        console.log(`[WS-IN] identify socket=${socket.id} hasToken=${!!data?.token}`);
        this.handleIdentify(socket, data);
      });

      // Game events
      socket.on("game:join", (data: { gameId: string }) => {
        console.log(`[WS-IN] game:join socket=${socket.id} game=${data?.gameId}`);
        this.handleGameJoin(socket, data);
      });

      socket.on("game:leave", (data: { gameId: string }) => {
        console.log(`[WS-IN] game:leave socket=${socket.id} game=${data?.gameId}`);
        this.handleGameLeave(socket, data);
      });

      // Round events
      socket.on("round:create", (data: { gameId: string; ticketName: string }) => {
        console.log(`[WS-IN] round:create socket=${socket.id} game=${data?.gameId}`);
        this.handleRoundCreate(socket, data).catch((err) =>
          console.error("[WS] round:create error:", err)
        );
      });

      socket.on("round:reveal", (data: { gameId: string; roundId: string }) => {
        console.log(`[WS-IN] round:reveal socket=${socket.id} game=${data?.gameId} round=${data?.roundId}`);
        this.handleRoundReveal(socket, data).catch((err) =>
          console.error("[WS] round:reveal error:", err)
        );
      });

      // Vote events
      socket.on("vote:submit", (data: { gameId: string; roundId: string; value: number }) => {
        console.log(`[WS-IN] vote:submit socket=${socket.id} game=${data?.gameId} round=${data?.roundId} value=${data?.value}`);
        this.handleVoteSubmit(socket, data).catch((err) =>
          console.error("[WS] vote:submit error:", err)
        );
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log(`[WS-IN] disconnect socket=${socket.id}`);
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
   * Handle round creation — persists to DB, emits real round ID
   */
  private async handleRoundCreate(socket: Socket, data: { gameId: string; ticketName: string }) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    try {
      const round = await this.gameService.createRound(data.gameId, userInfo.userId, data.ticketName);

      const event: RoundCreatedEvent = {
        gameId: data.gameId,
        roundId: round.id,
        ticketName: round.ticketName || "",
        ticketNumber: round.ticketNumber,
      };

      this.io.to(`game:${data.gameId}`).emit("round:created", event);
      console.log(`[WS] Round created in game ${data.gameId}: ${round.ticketName} (${round.id})`);
    } catch (err) {
      socket.emit("error", {
        message: err instanceof Error ? err.message : "Failed to create round",
      });
    }
  }

  /**
   * Handle round reveal — fetches real votes from DB, calculates average
   */
  private async handleRoundReveal(socket: Socket, data: { gameId: string; roundId: string }) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    try {
      const result = await this.gameService.revealRound(data.gameId, data.roundId, userInfo.userId);

      const event: RoundRevealedEvent = {
        gameId: data.gameId,
        roundId: data.roundId,
        votes: result.votes.map((v) => ({
          userId: v.userId,
          userNickname: v.userNickname,
          value: v.value as number | null,
        })),
        average: result.average,
      };

      this.io.to(`game:${data.gameId}`).emit("round:revealed", event);
      console.log(`[WS] Round revealed in game ${data.gameId}: avg=${result.average}`);
    } catch (err) {
      socket.emit("error", {
        message: err instanceof Error ? err.message : "Failed to reveal round",
      });
    }
  }

  /**
   * Handle vote submission — persists vote to DB, broadcasts without value
   */
  private async handleVoteSubmit(
    socket: Socket,
    data: { gameId: string; roundId: string; value: number }
  ) {
    const userInfo = this.userSockets.get(socket.id);

    if (!userInfo) {
      socket.emit("error", { message: "User not identified" });
      return;
    }

    try {
      await this.gameService.submitVote(data.roundId, userInfo.userId, data.value);

      const event: VoteSubmittedEvent = {
        gameId: data.gameId,
        roundId: data.roundId,
        userId: userInfo.userId,
        userNickname: userInfo.nickname,
      };

      this.io.to(`game:${data.gameId}`).emit("vote:submitted", event);
      console.log(`[WS] Vote submitted by ${userInfo.nickname} in round ${data.roundId}: ${data.value}`);
    } catch (err) {
      socket.emit("error", {
        message: err instanceof Error ? err.message : "Failed to submit vote",
      });
    }
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
    const room = `game:${event.gameId}`;
    const roomSize = this.io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`[WS-OUT] participant:joined room=${room} listeners=${roomSize}`);
    this.io.to(`game:${event.gameId}`).emit("participant:joined", event);
  }

  /**
   * Notify game of participant left
   */
  notifyParticipantLeft(event: ParticipantLeftEvent) {
    const room = `game:${event.gameId}`;
    const roomSize = this.io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`[WS-OUT] participant:left room=${room} listeners=${roomSize}`);
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
