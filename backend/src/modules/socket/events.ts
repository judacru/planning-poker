export interface GameEventData {
  gameId: string;
  userId: string;
  userNickname: string;
}

export interface ParticipantJoinedEvent extends GameEventData {
  participantCount: number;
}

export interface ParticipantLeftEvent extends GameEventData {
  participantCount: number;
}

export interface GameDeletedEvent {
  gameId: string;
}

export interface RoundCreatedEvent {
  gameId: string;
  roundId: string;
  ticketName: string;
  ticketNumber: number;
}

export interface VoteSubmittedEvent {
  gameId: string;
  roundId: string;
  userId: string;
}

export interface RoundRevealedEvent {
  gameId: string;
  roundId: string;
  votes: {
    userId: string;
    userNickname: string;
    value: number | null;
  }[];
  average: number;
}

export interface UserPresenceEvent {
  gameId: string;
  activeUsers: {
    userId: string;
    nickname: string;
    joinedAt: string;
  }[];
}
