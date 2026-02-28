import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AuthRepository } from "./repository.js";
import { RegisterDTO, LoginDTO, AuthResponse } from "./dto.js";
import { generateToken } from "../../utils/jwt.js";

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async register(data: RegisterDTO): Promise<{ userId: string; verificationToken: string }> {
    // Validate email
    const existingEmail = await this.repository.findUserByEmail(data.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Validate nickname
    const existingNickname = await this.repository.findUserByNickname(data.nickname);
    if (existingNickname) {
      throw new Error("Nickname already taken");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await this.repository.createUser({
      email: data.email,
      nickname: data.nickname,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      verificationToken,
    });

    return {
      userId: user.id,
      verificationToken,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email or nickname
    const isEmail = data.identifier.includes("@");
    const user = isEmail
      ? await this.repository.findUserByEmail(data.identifier)
      : await this.repository.findUserByNickname(data.identifier);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if verified
    if (!user.verified) {
      throw new Error("Please verify your email first");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        verified: user.verified,
      },
      token,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.repository.findUserByVerificationToken(token);
    if (!user) {
      throw new Error("Invalid verification token");
    }

    await this.repository.verifyUser(user.id);
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return "If email exists, reset link has been sent";
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await this.repository.setResetToken(user.id, resetToken);

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.repository.findUserByResetToken(token);
    if (!user) {
      throw new Error("Invalid reset token");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repository.updatePassword(user.id, passwordHash);
  }

  async getMe(userId: string): Promise<AuthResponse["user"]> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      verified: user.verified,
    };
  }
}
