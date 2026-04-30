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

// Response from get endpoint - includes participants
export interface GameDetail extends GameResponse {
  participants: GameParticipant[];
}

export interface GameListResponse {
  games: GameResponse[];
  total: number;
}

export interface RoundResponse {
  id: string;
  ticketName: string;
  state: 'WAITING' | 'VOTING' | 'REVEALED' | 'CLOSED';
  createdAt: string;
}

export interface GameBoardState {
  gameId: string;
  participants: GameParticipant[];
  currentRound?: RoundResponse;
  isHost: boolean;
  currentUserVote?: number;
}

export interface GameContextType {
  gamesList: GameResponse[];
  currentGame?: GameDetail;
  gameBoard?: GameBoardState;
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
