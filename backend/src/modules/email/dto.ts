// Email DTOs

export interface EmailVerificationDTO {
  email: string;
  token: string;
  verificationUrl: string;
}

export interface PasswordResetDTO {
  email: string;
  token: string;
  resetUrl: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
