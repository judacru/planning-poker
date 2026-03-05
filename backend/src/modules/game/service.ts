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
    };
  }
}
