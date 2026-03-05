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
  nickname: string;
  avatar?: string;
}

export interface GameResponse {
  id: string;
  inviteCode: string;
  hostId: string;
  createdAt: string;
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
  currentGame?: GameResponse;
  gameBoard?: GameBoardState;
  isLoading: boolean;
  error?: string;
  createGame: (request: CreateGameRequest) => Promise<GameResponse>;
  joinGame: (request: JoinGameRequest) => Promise<GameResponse>;
  getGames: () => Promise<void>;
  getGame: (gameId: string) => Promise<GameResponse>;
  deleteGame: (gameId: string) => Promise<void>;
  clearError: () => void;
  setCurrentGame: (game?: GameResponse) => void;
}
