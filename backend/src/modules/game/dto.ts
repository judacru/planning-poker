export interface CreateGameDTO {
  name?: string;
}

export interface JoinGameDTO {
  inviteCode: string;
}

export interface GameResponseDTO {
  id: string;
  inviteCode: string;
  name: string | null;
  hostId: string;
  hostNickname: string;
  participantCount: number;
  createdAt: Date;
}

export interface RoundDTO {
  id: string;
  ticketName: string;
  ticketNumber: number;
  state: "WAITING" | "VOTING" | "REVEALED" | "CLOSED";
  average: number | null;
  createdAt: Date;
}

export interface GameDetailDTO extends GameResponseDTO {
  participants: {
    id: string;
    userId: string;
    nickname: string;
    joinedAt: Date;
  }[];
  currentRound?: RoundDTO;
}

export interface RoundVoteDTO {
  userId: string;
  nickname: string;
  value: number | null;
}

export interface RoundHistoryDTO {
  id: string;
  ticketName: string;
  ticketNumber: number;
  state: "WAITING" | "VOTING" | "REVEALED" | "CLOSED";
  average: number | null;
  revealedAt: Date | null;
  createdAt: Date;
  votes: RoundVoteDTO[];
}
