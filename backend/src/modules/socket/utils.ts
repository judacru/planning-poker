import { ParticipantJoinedEvent, ParticipantLeftEvent } from "./events.js";
import { SocketService } from "./service.js";

/**
 * Get the global SocketService instance
 * This is set in index.ts after SocketService initialization
 */
export function getSocketService(): SocketService {
  return (global as any).socketService;
}

/**
 * Notify when a participant joins a game via REST API
 * Called from GameController after successful join
 */
export function notifyParticipantJoined(event: ParticipantJoinedEvent) {
  const socketService = getSocketService();
  if (socketService) {
    socketService.notifyParticipantJoined(event);
  }
}

/**
 * Notify when a participant leaves a game via REST API
 * Called when user removes themselves or is removed
 */
export function notifyParticipantLeft(event: ParticipantLeftEvent) {
  const socketService = getSocketService();
  if (socketService) {
    socketService.notifyParticipantLeft(event);
  }
}

/**
 * Notify when a game is deleted via REST API
 * Called from GameController after successful delete
 */
export function notifyGameDeleted(gameId: string) {
  const socketService = getSocketService();
  if (socketService) {
    socketService.notifyGameDeleted(gameId);
  }
}
