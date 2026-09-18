export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUserResponse {
  user_id: number;
  username: string;
  email: string;
  is_active: boolean;
  otp_expires_in?: string;
  email_verified?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  reset_token: string;
  password: string;
  confirm_password: string;
}
