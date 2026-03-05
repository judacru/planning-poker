import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { GameController } from "./controller";

const router = Router();
const controller = new GameController();

// All routes require authentication
router.use(authMiddleware);

// POST /api/games/create - Create a new game
router.post("/create", (req, res) => controller.createGame(req, res));

// POST /api/games/join - Join a game with invite code
router.post("/join", (req, res) => controller.joinGame(req, res));

// GET /api/games - Get all games for current user
router.get("/", (req, res) => controller.getActiveGames(req, res));

// GET /api/games/:gameId - Get game details
router.get("/:gameId", (req, res) => controller.getGame(req, res));

// DELETE /api/games/:gameId - Delete a game (host only)
router.delete("/:gameId", (req, res) => controller.deleteGame(req, res));

export default router;
