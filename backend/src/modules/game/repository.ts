import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GameRepository {
  async createGame(hostId: string, name: string | undefined, inviteCode: string) {
    return prisma.game.create({
      data: {
        hostId,
        name,
        inviteCode,
        participants: {
          create: {
            userId: hostId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, nickname: true },
            },
          },
        },
      },
    });
  }

  async getGameById(gameId: string) {
    return prisma.game.findUnique({
      where: { id: gameId },
      include: {
        host: { select: { id: true, nickname: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, nickname: true, email: true } },
          },
        },
        rounds: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }

  async getGameByInviteCode(inviteCode: string) {
    return prisma.game.findUnique({
      where: { inviteCode },
      include: {
        host: { select: { id: true, nickname: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, nickname: true, email: true } },
          },
        },
      },
    });
  }

  async joinGame(gameId: string, userId: string) {
    // Check if user is already a participant
    const existing = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: { gameId, userId },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.gameParticipant.create({
      data: {
        gameId,
        userId,
      },
    });
  }

  async getActiveGames(userId: string) {
    return prisma.game.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        host: { select: { id: true, nickname: true } },
        participants: true,
        rounds: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllGames() {
    return prisma.game.findMany({
      include: {
        host: { select: { id: true, nickname: true } },
        participants: true,
        rounds: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteGame(gameId: string) {
    return prisma.game.delete({
      where: { id: gameId },
    });
  }

  async isGameHost(gameId: string, userId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { hostId: true },
    });

    return game?.hostId === userId;
  }

  async isParticipant(gameId: string, userId: string) {
    const participant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: { gameId, userId },
      },
    });

    return !!participant;
  }
}
