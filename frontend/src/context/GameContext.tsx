/**
 * Game Context
 * 
 * Global state management for game operations.
 * Provides game CRUD methods and real-time updates via WebSocket.
 */

import React, { createContext, useCallback, useState, ReactNode } from 'react';
import gameService from '../modules/game/service';
import {
  GameContextType,
  GameResponse,
  GameDetail,
  CreateGameRequest,
  JoinGameRequest,
} from '../modules/game/types';

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gamesList, setGamesList] = useState<GameResponse[]>([]);
  const [currentGame, setCurrentGame] = useState<GameDetail | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const createGame = useCallback(async (request: CreateGameRequest) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const game = await gameService.createGame(request);
      return game;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinGame = useCallback(async (request: JoinGameRequest) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const game = await gameService.joinGame(request);
      // Add to games list if not already there
      setGamesList((prev) => {
        const exists = prev.find((g) => g.id === game.id);
        return exists ? prev : [...prev, game];
      });
      return game;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGames = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      console.log('📋 Fetching games list from API...');
      const response = await gameService.getGames();
      console.log('📋 Games loaded:', response.games.length, 'games');
      setGamesList(response.games);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load games';
      console.error('❌ Failed to load games:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGame = useCallback(async (gameId: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const game = await gameService.getGame(gameId);
      setCurrentGame(game);
      return game;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGame = useCallback(async (gameId: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      await gameService.deleteGame(gameId);
      // Remove from games list
      setGamesList((prev) => prev.filter((g) => g.id !== gameId));
      // Clear current game if deleted
      setCurrentGame((prev) => (prev?.id === gameId ? undefined : prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete game';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveGame = useCallback(async (gameId: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      console.log('🚪 Leaving game:', gameId);
      await gameService.leaveGame(gameId);
      console.log('✅ Successfully left game:', gameId);
      // Remove from games list
      setGamesList((prev) => prev.filter((g) => g.id !== gameId));
      // Clear current game if left
      setCurrentGame((prev) => (prev?.id === gameId ? undefined : prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave game';
      console.error('❌ Error leaving game:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGameParticipants = useCallback((gameId: string, participants: any[]) => {
    setCurrentGame((prev) => {
      if (prev && prev.id === gameId) {
        return {
          ...prev,
          participants,
          participantCount: participants.length,
        };
      }
      return prev;
    });
  }, []);

  const value: GameContextType = {
    gamesList,
    currentGame,
    isLoading,
    error,
    createGame,
    joinGame,
    getGames,
    getGame,
    deleteGame,
    leaveGame,
    clearError,
    setCurrentGame,
    updateGameParticipants,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
