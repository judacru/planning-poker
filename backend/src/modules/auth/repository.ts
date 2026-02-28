import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthRepository {
  async createUser(data: {
    email: string;
    nickname: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    verificationToken: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByNickname(nickname: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { nickname },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }

  async findUserByResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { resetToken: token },
    });
  }

  async verifyUser(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        verified: true,
        verificationToken: null,
      },
    });
  }

  async setResetToken(userId: string, token: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { resetToken: token },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetToken: null,
      },
    });
  }
}
