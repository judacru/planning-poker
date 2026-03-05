/**
 * useGame Hook
 * 
 * Custom hook to access GameContext.
 * Provides type-safe access to game state and operations.
 */

import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { GameContextType } from '../modules/game/types';

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
