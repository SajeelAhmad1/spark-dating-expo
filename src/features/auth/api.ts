// src/features/auth/api.ts
import { apiPost } from '@/api/client';
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
} from '@/features/auth/schema';

export const authApi = {
  // sign-up
  setPassword: async (dto: SetPasswordDto): Promise<void> => {
    SetPasswordDtoSchema.parse(dto);
    await apiPost(ENDPOINTS.AUTH.SET_PASSWORD, dto);
  },

  // sign-up start with phone — returns signupStartSchemaResponse so callers can read signupSessionId
  signupStartPhone: async (
    payload: SignupStartPhoneDto | SignupStartEmailDto,
  ): Promise<SignupStartResponse> => {
    return await apiPost<SignupStartResponse>(
      ENDPOINTS.AUTH.SIGNUP_START,
      payload,
    );
  },

  // verify otp phone
  verifyOtpPhone: async (dto: VerifyOtpPhoneDto) => {
    VerifyOtpDtoSchema.parse(dto);
    return await apiPost(ENDPOINTS.AUTH.SIGNUP_VERIFY_OTP, dto);
  },

  // login

  login: async (dto: LoginDto): Promise<LoginResponse> => {
    LoginDtoSchema.parse(dto);
    const raw = await apiPost(ENDPOINTS.AUTH.LOGIN, dto);
    return LoginResponseSchema.parse(raw);
  },

  // logout
  logout: async (): Promise<void> => {
    await apiPost(ENDPOINTS.AUTH.LOGOUT);
  },
};
