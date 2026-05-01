import { Request, Response, NextFunction } from "express";
import { GameRepository } from "../modules/game/repository.js";

const repository = new GameRepository();

/**
 * Middleware that verifies the authenticated user is the host of the game.
 * Expects :gameId in route params and userId set by authMiddleware.
 */
export async function hostMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = (req as any).userId;
  const { gameId } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!gameId) {
    res.status(400).json({ error: "gameId is required" });
    return;
  }

  const isHost = await repository.isGameHost(gameId, userId);

  if (!isHost) {
    res.status(403).json({ error: "Only the host can perform this action" });
    return;
  }

  next();
}
