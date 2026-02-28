// Auth DTOs

export interface RegisterDTO {
  email: string;
  nickname: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDTO {
  identifier: string; // email or nickname
  password: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nickname: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    verified: boolean;
  };
  token: string;
}
