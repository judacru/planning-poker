import { Request, Response } from "express";
import { GameService } from "./service";
import { GameRepository } from "./repository";
import { CreateGameDTO, JoinGameDTO } from "./dto";
import { notifyParticipantJoined, notifyParticipantLeft } from "../socket/utils.js";

export class GameController {
  private service: GameService;

  constructor() {
    const repository = new GameRepository();
    this.service = new GameService(repository);
  }

  /**
   * POST /api/games/create
   * Create a new game (requires auth)
   */
  async createGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const data: CreateGameDTO = {
        name: req.body.ticketName || req.body.name,
      };

      const game = await this.service.createGame(userId, data);

      res.status(201).json({
        success: true,
        data: game,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create game",
      });
    }
  }

  /**
   * POST /api/games/join
   * Join an existing game using invite code (requires auth)
   */
  async joinGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const data: JoinGameDTO = req.body;

      if (!data.inviteCode) {
        res.status(400).json({ error: "inviteCode is required" });
        return;
      }

      const game = await this.service.joinGame(userId, data.inviteCode);

      // Notify other users in the game that this user joined
      const newParticipant = game.participants.find((p) => p.userId === userId);
      notifyParticipantJoined({
        gameId: game.id,
        userId: userId,
        userNickname: newParticipant?.nickname || "Unknown",
        participantCount: game.participantCount,
      });

      res.status(200).json({
        success: true,
        data: game,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to join game";
      res.status(error instanceof Error && message.includes("not found") ? 404 : 500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/games/:gameId
   * Get game details (requires auth, must be participant)
   */
  async getGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { gameId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Check if user is a participant
      const isParticipant = await this.service.isParticipant(gameId, userId);
      if (!isParticipant) {
        res.status(403).json({ error: "You are not a participant in this game" });
        return;
      }

      const game = await this.service.getGame(gameId);

      res.status(200).json({
        success: true,
        data: game,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get game";
      res.status(message.includes("not found") ? 404 : 500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/games
   * Get all games for current user (requires auth)
   */
  async getActiveGames(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const games = await this.service.getActiveGames(userId);
      console.log(`[API] GET /api/games - User ${userId} has ${games.length} active games`);

      res.status(200).json({
        success: true,
        data: {
          games,
          total: games.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to get games",
      });
    }
  }

  /**
   * POST /api/games/:gameId/leave
   * Leave a game (removes participant)
   */
  async leaveGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { gameId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      console.log(`[API] POST /api/games/${gameId}/leave - User ${userId} leaving game`);

      const game = await this.service.getGame(gameId);
      const participantCount = game.participants.length - 1;

      await this.service.leaveGame(gameId, userId);
      console.log(`[API] User ${userId} removed from game ${gameId}. Remaining: ${participantCount}`);

      // Notify other users that this user left
      const leavingParticipant = game.participants.find((p) => p.userId === userId);
      notifyParticipantLeft({
        gameId,
        userId,
        userNickname: leavingParticipant?.nickname || "Unknown",
        participantCount,
      });

      res.status(200).json({
        success: true,
        message: "Left game successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to leave game";
      res.status(message.includes("not found") ? 404 : 500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * DELETE /api/games/:gameId
   * Delete a game (host only)
   */
  async deleteGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { gameId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await this.service.deleteGame(gameId, userId);

      res.status(200).json({
        success: true,
        message: "Game deleted successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete game";
      res
        .status(
          message.includes("Only the host") ? 403 : message.includes("not found") ? 404 : 500
        )
        .json({
          success: false,
          error: message,
        });
    }
  }

  /**
   * GET /api/games/:gameId/rounds
   * Get revealed round history for a game (requires auth, must be participant)
   */
  async getRoundHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { gameId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const rounds = await this.service.getRoundHistory(gameId, userId);

      res.status(200).json({
        success: true,
        data: { rounds, total: rounds.length },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get round history";
      res
        .status(message.includes("not a participant") ? 403 : 500)
        .json({ success: false, error: message });
    }
  }
}
