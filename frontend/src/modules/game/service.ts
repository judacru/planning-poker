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
  GameListResponse,
} from './types';

class GameService {
  /**
   * Create a new game
   */
  async createGame(request: CreateGameRequest): Promise<GameResponse> {
    const response = await api.post<GameResponse>('/games', request);
    return response.data;
  }

  /**
   * Join an existing game using invite code
   */
  async joinGame(request: JoinGameRequest): Promise<GameResponse> {
    const response = await api.post<GameResponse>('/games/join', request);
    return response.data;
  }

  /**
   * Get list of user's games
   */
  async getGames(): Promise<GameListResponse> {
    const response = await api.get<GameListResponse>('/games');
    return response.data;
  }

  /**
   * Get single game details
   */
  async getGame(gameId: string): Promise<GameResponse> {
    const response = await api.get<GameResponse>(`/games/${gameId}`);
    return response.data;
  }

  /**
   * Delete a game (host only)
   */
  async deleteGame(gameId: string): Promise<void> {
    await api.delete(`/games/${gameId}`);
  }
}

export default new GameService();
