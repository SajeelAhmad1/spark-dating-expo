import { apiPost, tokenStore } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
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
} from '@/features/auth/schema'

export const authApi = {
  // ── Sign-up ─────────────────────────────────────────────────────────────────

  setPassword: async (dto: SetPasswordDto): Promise<void> => {
    SetPasswordDtoSchema.parse(dto)
    await apiPost(ENDPOINTS.AUTH.SET_PASSWORD, dto)
  },

  signupStartPhone: async (
    payload: SignupStartPhoneDto | SignupStartEmailDto,
  ): Promise<SignupStartResponse> =>
    apiPost<SignupStartResponse>(ENDPOINTS.AUTH.SIGNUP_START, payload),

  verifyOtpPhone: async (dto: VerifyOtpPhoneDto) => {
    VerifyOtpDtoSchema.parse(dto)
    return apiPost(ENDPOINTS.AUTH.SIGNUP_VERIFY_OTP, dto)
  },

  // ── Login ───────────────────────────────────────────────────────────────────

  login: async (dto: LoginDto): Promise<LoginResponse> => {
    LoginDtoSchema.parse(dto)
    const raw = await apiPost(ENDPOINTS.AUTH.LOGIN, dto)
    return LoginResponseSchema.parse(raw)
  },

  // ── Google ──────────────────────────────────────────────────────────────────

  googleVerify: async (idToken: string): Promise<GoogleAuthResponse> => {
    const raw = await apiPost(ENDPOINTS.AUTH.LOGIN_WITH_GOOGLE, { idToken })
    return GoogleAuthResponseSchema.parse(raw)
  },

  // ── Logout ──────────────────────────────────────────────────────────────────

  logout: async (): Promise<void> => {
    const refreshToken = await tokenStore.getRefresh()
    if (refreshToken) await apiPost(ENDPOINTS.AUTH.LOGOUT, { refreshToken })
  },

  // ── Forgot password ─────────────────────────────────────────────────────────

  forgotPasswordStart: async (payload: {
    phone?: string
    email?: string
  }): Promise<{ sessionId: string }> =>
    apiPost(ENDPOINTS.AUTH.FORGOT_PASSWORD_START, payload),

  forgotPasswordVerify: async (payload: {
    sessionId:  string
    code:       string
    phone?:     string
    email?:     string
  }): Promise<{ resetToken: string }> =>
    apiPost(ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY, payload),

  forgotPasswordReset: async (payload: {
    resetToken:  string
    newPassword: string
  }): Promise<void> =>
    apiPost(ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, payload),
}