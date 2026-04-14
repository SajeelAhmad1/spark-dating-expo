// src/features/auth/api.ts
import { apiPost, tokenStore } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  LoginDto,
  LoginResponse,
  LoginDtoSchema,
  LoginResponseSchema,
  SetPasswordDto,
  SetPasswordDtoSchema,
  SignupStartPhoneDto,
  SignupStartResponse,
  VerifyOtpPhoneDto,
  VerifyOtpDtoSchema,
  SignupStartEmailDto,
  GoogleAuthResponse,
  GoogleAuthResponseSchema,
} from '@/features/auth/schema';

export const authApi = {
  // ── Sign-up ─────────────────────────────────────────────────────────────────

  setPassword: async (dto: SetPasswordDto): Promise<void> => {
    SetPasswordDtoSchema.parse(dto);
    await apiPost(ENDPOINTS.AUTH.SET_PASSWORD, dto);
  },

  signupStartPhone: async (
    payload: SignupStartPhoneDto | SignupStartEmailDto,
  ): Promise<SignupStartResponse> => {
    return await apiPost<SignupStartResponse>(ENDPOINTS.AUTH.SIGNUP_START, payload);
  },

  verifyOtpPhone: async (dto: VerifyOtpPhoneDto) => {
    VerifyOtpDtoSchema.parse(dto);
    return await apiPost(ENDPOINTS.AUTH.SIGNUP_VERIFY_OTP, dto);
  },

  // ── Login ───────────────────────────────────────────────────────────────────

  login: async (dto: LoginDto): Promise<LoginResponse> => {
    LoginDtoSchema.parse(dto);
    const raw = await apiPost(ENDPOINTS.AUTH.LOGIN, dto);
    return LoginResponseSchema.parse(raw);
  },

  // ── Google ──────────────────────────────────────────────────────────────────

  /**
   * Sends the Google ID token (from expo-auth-session) to the backend.
   * Backend verifies it with Google, creates/finds the user, and returns tokens.
   */
  googleVerify: async (idToken: string): Promise<GoogleAuthResponse> => {
    const raw = await apiPost(ENDPOINTS.AUTH.LOGIN_WITH_GOOGLE, { idToken });
    return GoogleAuthResponseSchema.parse(raw);
  },

  // ── Logout ──────────────────────────────────────────────────────────────────

logout: async (): Promise<void> => {
  const refreshToken = await tokenStore.getRefresh();
  if (refreshToken) {
    await apiPost(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  }
},
};