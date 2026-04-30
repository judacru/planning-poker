import { randomBytes } from "crypto";
import { GameRepository } from "./repository";
import { CreateGameDTO, GameResponseDTO, GameDetailDTO } from "./dto";

export class GameService {
  constructor(private repository: GameRepository) {}

  /**
   * Generate a 6-character alphanumeric invite code
   */
  private generateInviteCode(): string {
    return randomBytes(3).toString("hex").toUpperCase();
  }

  /**
   * Create a new game (host only)
   */
  async createGame(userId: string, data: CreateGameDTO): Promise<GameResponseDTO> {
    const inviteCode = this.generateInviteCode();

    const game = await this.repository.createGame(userId, data.name, inviteCode);

    return this.mapGameToResponse(game);
  }

  /**
   * Join an existing game using invite code
   */
  async joinGame(userId: string, inviteCode: string): Promise<GameDetailDTO> {
    const game = await this.repository.getGameByInviteCode(inviteCode);

    if (!game) {
      throw new Error("Game not found with this invite code");
    }

    // Check if user is already a participant
    const isParticipant = await this.repository.isParticipant(game.id, userId);
    if (!isParticipant) {
      await this.repository.joinGame(game.id, userId);
    }

    return this.mapGameToDetail(game);
  }

  /**
   * Get game details by ID
   */
  async getGame(gameId: string): Promise<GameDetailDTO> {
    const game = await this.repository.getGameById(gameId);

    if (!game) {
      throw new Error("Game not found");
    }

    return this.mapGameToDetail(game);
  }

  /**
   * Get all active games for a user
   */
  async getActiveGames(userId: string): Promise<GameResponseDTO[]> {
    const games = await this.repository.getActiveGames(userId);
    return games.map((game) => this.mapGameToResponse(game));
  }

  /**
   * Get all games (admin only)
   */
  async getAllGames(): Promise<GameResponseDTO[]> {
    const games = await this.repository.getAllGames();
    return games.map((game) => this.mapGameToResponse(game));
  }

  /**
   * Delete a game (host only)
   */
  async deleteGame(gameId: string, userId: string): Promise<void> {
    const isHost = await this.repository.isGameHost(gameId, userId);

    if (!isHost) {
      throw new Error("Only the host can delete the game");
    }

    await this.repository.deleteGame(gameId);
  }

  /**
   * Leave a game (remove as participant)
   */
  async leaveGame(gameId: string, userId: string): Promise<void> {
    const isParticipant = await this.repository.isParticipant(gameId, userId);

    if (!isParticipant) {
      throw new Error("User is not a participant in this game");
    }

    console.log(`[Service] Removing user ${userId} from game ${gameId}`);
    await this.repository.removeParticipant(gameId, userId);
    console.log(`[Service] User ${userId} successfully removed from game ${gameId}`);
  }

  /**
   * Check if user is host of game
   */
  async isHost(gameId: string, userId: string): Promise<boolean> {
    return this.repository.isGameHost(gameId, userId);
  }

  /**
   * Check if user is participant of game
   */
  async isParticipant(gameId: string, userId: string): Promise<boolean> {
    return this.repository.isParticipant(gameId, userId);
  }

  // ─── Round ────────────────────────────────────────────────────────────────

  /**
   * Create a new round (host only)
   */
  async createRound(gameId: string, userId: string, ticketName: string) {
    const isHost = await this.repository.isGameHost(gameId, userId);
    if (!isHost) throw new Error("Only the host can create rounds");

    const lastNum = await this.repository.getLastRoundNumber(gameId);
    return this.repository.createRound(gameId, ticketName, lastNum + 1);
  }

  /**
   * Submit or change a vote
   */
  async submitVote(roundId: string, userId: string, value: number) {
    return this.repository.upsertVote(roundId, userId, value);
  }

  /**
   * Reveal all votes for a round (host only), returns votes + average
   */
  async revealRound(gameId: string, roundId: string, userId: string) {
    const isHost = await this.repository.isGameHost(gameId, userId);
    if (!isHost) throw new Error("Only the host can reveal votes");

    const round = await this.repository.getRoundById(roundId);
    if (!round) throw new Error("Round not found");

    const validVotes = round.votes.filter((v) => v.value !== null);
    const average =
      validVotes.length > 0
        ? validVotes.reduce((sum, v) => sum + (v.value ?? 0), 0) / validVotes.length
        : 0;

    await this.repository.revealRound(roundId, Math.round(average * 100) / 100);

    return {
      votes: round.votes.map((v) => ({
        userId: v.userId,
        userNickname: v.user.nickname,
        value: v.value,
      })),
      average: Math.round(average * 100) / 100,
    };
  }

  /**
   * Map game to response DTO
   */
  private mapGameToResponse(game: any): GameResponseDTO {
    return {
      id: game.id,
      inviteCode: game.inviteCode,
      name: game.name,
      hostId: game.hostId,
      hostNickname: game.host?.nickname || "Unknown",
      participantCount: game.participants?.length || 0,
      createdAt: game.createdAt,
    };
  }

  /**
   * Map game to detail DTO
   */
  private mapGameToDetail(game: any): GameDetailDTO {
    return {
      id: game.id,
      inviteCode: game.inviteCode,
      name: game.name,
      hostId: game.hostId,
      hostNickname: game.host?.nickname || "Unknown",
      participantCount: game.participants?.length || 0,
      createdAt: game.createdAt,
      participants: (game.participants || []).map((p: any) => ({
        id: p.id,
        userId: p.userId,
        nickname: p.user?.nickname || "Unknown",
        joinedAt: p.joinedAt,
      })),
      currentRound: game.rounds?.[0]
        ? {
            id: game.rounds[0].id,
            ticketName: game.rounds[0].ticketName || "",
            ticketNumber: game.rounds[0].ticketNumber,
            state: game.rounds[0].state,
            average: game.rounds[0].average,
            createdAt: game.rounds[0].createdAt,
          }
        : undefined,
    };
  }
}
