// src/features/auth/api.ts
import { apiPost } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  LoginDto,
  AuthResponse,
  LoginDtoSchema,
  AuthResponseSchema,
  SetPasswordDto,
  SetPasswordDtoSchema,
  SignupStartPhoneDto,
  SignupStartResponse,
  VerifyOtpPhoneDto,
  VerifyOtpPhoneDtoSchema,
  SignupStartEmailDto,
} from '@/features/auth/schema';

export const authApi = {
  // sign-up
  setPassword: async (dto: SetPasswordDto): Promise<void> => {
    SetPasswordDtoSchema.parse(dto);
    await apiPost(ENDPOINTS.AUTH.SET_PASSWORD, dto);
  },

  // sign-up start with phone — returns signupStartSchemaResponse so callers can read signupSessionId
  signupStartPhone: async (payload: SignupStartPhoneDto | SignupStartEmailDto): Promise<SignupStartResponse> => {
    return await apiPost<SignupStartResponse>(ENDPOINTS.AUTH.REGISTER_START_PHONE, payload);
  },

  // verify otp phone
  verifyOtpPhone: async (dto: VerifyOtpPhoneDto) => {
    VerifyOtpPhoneDtoSchema.parse(dto);
    return await apiPost(ENDPOINTS.AUTH.VERIFY_OTP_PHONE, dto);
  },

  // login
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    LoginDtoSchema.parse(dto);
    const raw = await apiPost(ENDPOINTS.AUTH.LOGIN, dto);
    return AuthResponseSchema.parse(raw);
  },

  // logout
  logout: async (): Promise<void> => {
    await apiPost(ENDPOINTS.AUTH.LOGOUT);
  },
};