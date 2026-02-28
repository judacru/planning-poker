import { Request, Response } from "express";
import { AuthService } from "./service.js";
import { RegisterDTO, LoginDTO } from "./dto.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDTO = req.body;

      // Validate input
      if (!data.email || !data.nickname || !data.password) {
        res.status(400).json({ error: "Email, nickname, and password are required" });
        return;
      }

      const result = await authService.register(data);

      // TODO: Send verification email in PR-4
      console.log(`Verification token for ${data.email}: ${result.verificationToken}`);

      res.status(201).json({
        message: "User registered successfully. Please check your email for verification.",
        userId: result.userId,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDTO = req.body;

      if (!data.identifier || !data.password) {
        res.status(400).json({ error: "Email/nickname and password are required" });
        return;
      }

      const result = await authService.login(data);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: "Token is required" });
        return;
      }

      await authService.verifyEmail(token);

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const resetToken = await authService.forgotPassword(email);

      // TODO: Send reset email in PR-4
      console.log(`Reset token for ${email}: ${resetToken}`);

      res.status(200).json({
        message: "If email exists, password reset link has been sent",
      });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: "Token and new password are required" });
        return;
      }

      await authService.resetPassword(token, newPassword);

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId; // Set by auth middleware

      const user = await authService.getMe(userId);

      res.status(200).json({ user });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
