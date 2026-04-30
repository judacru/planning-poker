/**
 * useSocket Hook
 * 
 * Custom hook for WebSocket connection management.
 * Initializes socket on mount and cleans up on unmount.
 */

import { useEffect } from 'react';
import socketService from '../services/socket';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      socketService.disconnect();
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[UI-WS] auth_token missing while authenticated');
      return;
    }

    socketService.connect(token);
  }, [isAuthenticated, isLoading]);

  return socketService;
};
