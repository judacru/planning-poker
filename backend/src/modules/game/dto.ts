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

export interface GameDetailDTO extends GameResponseDTO {
  participants: {
    id: string;
    userId: string;
    nickname: string;
    joinedAt: Date;
  }[];
}
