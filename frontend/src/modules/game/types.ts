/**
 * Game Module Type Definitions
 * 
 * Contains interfaces for game creation, joining, and board state.
 */

export interface CreateGameRequest {
  ticketName: string;
}

export interface JoinGameRequest {
  inviteCode: string;
}

export interface GameParticipant {
  id: string;
  userId?: string;
  nickname: string;
  avatar?: string;
  joinedAt?: string;
}

// Response from create/join/list endpoints - no participant list
export interface GameResponse {
  id: string;
  inviteCode: string;
  name: string | null;
  hostId: string;
  hostNickname: string;
  participantCount: number;
  createdAt: string;
}

export interface RoundResponse {
  id: string;
  ticketName: string;
  ticketNumber: number;
  state: 'WAITING' | 'VOTING' | 'REVEALED' | 'CLOSED';
  average: number | null;
  createdAt: string;
}

// Response from get endpoint - includes participants and current round
export interface GameDetail extends GameResponse {
  participants: GameParticipant[];
  currentRound?: RoundResponse;
}

export interface GameListResponse {
  games: GameResponse[];
  total: number;
}

export interface VoteResult {
  userId: string;
  nickname: string;
  value: number | null;
}

export interface RoundRevealedPayload {
  gameId: string;
  roundId: string;
  votes: VoteResult[];
  average: number;
}

export interface VoteSubmittedPayload {
  gameId: string;
  roundId: string;
  userId: string;
  userNickname: string;
}

export interface RoundCreatedPayload {
  gameId: string;
  roundId: string;
  ticketName: string;
  ticketNumber: number;
}

export interface GameContextType {
  gamesList: GameResponse[];
  currentGame?: GameDetail;
  isLoading: boolean;
  error?: string;
  createGame: (request: CreateGameRequest) => Promise<GameResponse>;
  joinGame: (request: JoinGameRequest) => Promise<GameResponse>;
  getGames: () => Promise<void>;
  getGame: (gameId: string) => Promise<GameDetail>;
  deleteGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  clearError: () => void;
  setCurrentGame: (game?: GameDetail) => void;
  updateGameParticipants: (gameId: string, participants: GameParticipant[]) => void;
}
