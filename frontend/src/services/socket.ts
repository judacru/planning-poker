/**
 * Socket.io Service
 * 
 * Manages WebSocket connection for real-time game updates.
 */

import { io, Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private gameId: string | null = null;
  private identified = false;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Socket {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[UI-WS] connected');
      // Authenticate with backend
      this.identified = false;
      this.socket!.emit('identify', { token });
      console.log('[UI-WS->] identify');
    });

    this.socket.on('identified', (data) => {
      console.log('[UI-WS] identified:', data);
      this.identified = true;

      if (this.gameId) {
        this.socket!.emit('game:join', { gameId: this.gameId });
        console.log(`[UI-WS->] game:join ${this.gameId}`);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('[UI-WS] disconnected');
      this.identified = false;
    });

    this.socket.on('error', (error) => {
      console.error('[UI-WS] error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[UI-WS] connect_error:', error.message);
    });

    this.socket.onAny((event, ...args) => {
      console.log(`[UI-WS<-] ${event}`, args[0]);
    });

    return this.socket;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.gameId = null;
      this.identified = false;
    }
  }

  /**
   * Join a game room
   */
  joinGameRoom(gameId: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.gameId = gameId;

    if (this.socket.connected && this.identified) {
      this.socket.emit('game:join', { gameId });
      console.log(`[UI-WS->] game:join ${gameId}`);
    } else {
      console.log(`[UI-WS] deferred game:join ${gameId} connected=${this.socket.connected} identified=${this.identified}`);
    }
  }

  /**
   * Leave a game room
   */
  leaveGameRoom(): void {
    if (!this.socket || !this.gameId) return;
    console.log(`[UI-WS->] game:leave ${this.gameId}`);
    this.socket.emit('game:leave', { gameId: this.gameId });
    this.gameId = null;
  }

  /**
   * Submit a vote
   */
  submitVote(gameId: string, roundId: string, value: number): void {
    if (!this.socket) return;
    console.log(`[UI-WS->] vote:submit game=${gameId} round=${roundId} value=${value}`);
    this.socket.emit('vote:submit', { gameId, roundId, value });
  }

  /**
   * Create a new round
   */
  createRound(gameId: string, ticketName: string): void {
    if (!this.socket) return;
    console.log(`[UI-WS->] round:create game=${gameId} ticket=${ticketName}`);
    this.socket.emit('round:create', { gameId, ticketName });
  }

  /**
   * Reveal votes
   */
  revealVotes(gameId: string, roundId: string): void {
    if (!this.socket) return;
    console.log(`[UI-WS->] round:reveal game=${gameId} round=${roundId}`);
    this.socket.emit('round:reveal', { gameId, roundId });
  }

  /**
   * Listen to participant joined event
   */
  onParticipantJoined(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('participant:joined', callback);
  }

  offParticipantJoined(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off('participant:joined', callback);
  }

  /**
   * Listen to participant left event
   */
  onParticipantLeft(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('participant:left', callback);
  }

  offParticipantLeft(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off('participant:left', callback);
  }

  /**
   * Listen to vote submitted event
   */
  onVoteSubmitted(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('vote:submitted', callback);
  }

  offVoteSubmitted(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off('vote:submitted', callback);
  }

  /**
   * Listen to votes revealed event
   */
  onVotesRevealed(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('round:revealed', callback);
  }

  offVotesRevealed(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off('round:revealed', callback);
  }

  /**
   * Listen to round created event
   */
  onRoundCreated(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('round:created', callback);
  }

  offRoundCreated(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off('round:created', callback);
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
