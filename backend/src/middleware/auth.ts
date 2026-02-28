import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // Attach user info to request
    (req as any).userId = payload.userId;
    (req as any).userEmail = payload.email;
    (req as any).userNickname = payload.nickname;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
