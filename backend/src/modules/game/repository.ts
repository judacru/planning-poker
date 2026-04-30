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

  async removeParticipant(gameId: string, userId: string) {
    return prisma.gameParticipant.delete({
      where: {
        gameId_userId: { gameId, userId },
      },
    });
  }

  // ─── Round ────────────────────────────────────────────────────────────────

  async getLastRoundNumber(gameId: string): Promise<number> {
    const round = await prisma.round.findFirst({
      where: { gameId },
      orderBy: { ticketNumber: "desc" },
      select: { ticketNumber: true },
    });
    return round?.ticketNumber ?? 0;
  }

  async createRound(gameId: string, ticketName: string, ticketNumber: number) {
    return prisma.round.create({
      data: { gameId, ticketName, ticketNumber, state: "VOTING" },
    });
  }

  async getRoundById(roundId: string) {
    return prisma.round.findUnique({
      where: { id: roundId },
      include: {
        votes: {
          include: { user: { select: { id: true, nickname: true } } },
        },
      },
    });
  }

  async revealRound(roundId: string, average: number) {
    return prisma.round.update({
      where: { id: roundId },
      data: { state: "REVEALED", average, revealedAt: new Date() },
    });
  }

  // ─── Vote ─────────────────────────────────────────────────────────────────

  async upsertVote(roundId: string, userId: string, value: number) {
    return prisma.vote.upsert({
      where: { roundId_userId: { roundId, userId } },
      update: { value },
      create: { roundId, userId, value },
    });
  }
}
