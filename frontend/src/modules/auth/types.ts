export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  verified: boolean;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface MeResponse {
  user: AuthUser;
}
