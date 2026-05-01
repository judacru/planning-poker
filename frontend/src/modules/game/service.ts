/**
 * Game Service
 * 
 * Handles all API calls to the backend game endpoints.
 * Includes methods for game CRUD operations.
 */

import { api } from '../../services/api';
import {
  CreateGameRequest,
  JoinGameRequest,
  GameResponse,
  GameDetail,
  GameListResponse,
  RoundHistory,
} from './types';

class GameService {
  /**
   * Create a new game
   */
  async createGame(request: CreateGameRequest): Promise<GameResponse> {
    const response = await api.post<{ success: boolean; data: GameResponse }>('/games/create', request);
    return response.data.data;
  }

  /**
   * Join an existing game using invite code
   */
  async joinGame(request: JoinGameRequest): Promise<GameResponse> {
    const response = await api.post<{ success: boolean; data: GameResponse }>('/games/join', request);
    return response.data.data;
  }

  /**
   * Get list of user's games
   */
  async getGames(): Promise<GameListResponse> {
    const response = await api.get<{ success: boolean; data: GameListResponse }>('/games');
    return response.data.data;
  }

  /**
   * Get single game details
   */
  async getGame(gameId: string): Promise<GameDetail> {
    const response = await api.get<{ success: boolean; data: GameDetail }>(`/games/${gameId}`);
    return response.data.data;
  }

  /**
   * Leave a game
   */
  async leaveGame(gameId: string): Promise<void> {
    await api.post(`/games/${gameId}/leave`, {});
  }

  /**
   * Delete a game (host only)
   */
  async deleteGame(gameId: string): Promise<void> {
    await api.delete(`/games/${gameId}`);
  }

  /**
   * Get revealed round history for a game
   */
  async getRoundHistory(gameId: string): Promise<RoundHistory[]> {
    const response = await api.get<{ success: boolean; data: { rounds: RoundHistory[] } }>(`/games/${gameId}/rounds`);
    return response.data.data.rounds;
  }
}

export default new GameService();
