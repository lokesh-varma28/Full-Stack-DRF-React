import { apiClient } from './client';
import {
  AuthTokens,
  AuthUserResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  VerifyOtpRequest,
  VerifyResetOtpRequest,
} from '../types/auth';
import { ApiResponse } from '../types/api';

export const authApi = {
  // Register user
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthUserResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthUserResponse>>('/register/', data);
    return res.data;
  },

  // Verify email OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<AuthUserResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthUserResponse>>('/verify-otp/', data);
    return res.data;
  },

  // Resend email OTP
  resendOtp: async (email: string): Promise<ApiResponse<{ email: string; otp_expires_in: string }>> => {
    const res = await apiClient.post<ApiResponse<{ email: string; otp_expires_in: string }>>('/auth/resend-otp/', { email });
    return res.data;
  },

  // Login - SimpleJWT returns raw { access, refresh }
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const res = await apiClient.post<AuthTokens>('/login/', data);
    return res.data;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me/');
    return res.data;
  },

  // Forgot password - step 1
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<{ email: string; otp_expires_in: string }>> => {
    const res = await apiClient.post<ApiResponse<{ email: string; otp_expires_in: string }>>('/forgot-password/', data);
    return res.data;
  },

  // Forgot password - step 2 verify OTP
  verifyPasswordResetOtp: async (data: VerifyResetOtpRequest): Promise<ApiResponse<{ email: string; reset_token: string; reset_token_expires_in: string }>> => {
    const res = await apiClient.post<ApiResponse<{ email: string; reset_token: string; reset_token_expires_in: string }>>('/forgot-password/verify-otp/', data);
    return res.data;
  },

  // Forgot password - step 3 reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<{ email: string; password_reset: boolean }>> => {
    const res = await apiClient.post<ApiResponse<{ email: string; password_reset: boolean }>>('/forgot-password/reset/', data);
    return res.data;
  },
};
