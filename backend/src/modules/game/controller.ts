import { Request, Response } from "express";
import { GameService } from "./service";
import { GameRepository } from "./repository";
import { CreateGameDTO, JoinGameDTO } from "./dto";

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
        name: req.body.name,
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

      res.status(200).json({
        success: true,
        data: games,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to get games",
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
}
