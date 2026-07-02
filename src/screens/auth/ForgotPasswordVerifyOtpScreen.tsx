import React, { useEffect, useRef, useState } from 'react'
import {
  View, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native'
import { Text }       from '@/components/common/Text'
import { ChevronLeft } from 'lucide-react-native'
import PrimaryButton  from '@/components/common/PrimaryButton'
import { FieldError } from '@/components/common/FieldError'
import { sf, sw, sh, sr } from '@/utils/sizeMatters'
import { showToast }  from '@/utils/toast'
import { useForgotPasswordVerify, useForgotPasswordStart } from '@/features/auth/hooks'

// ── Constants ─────────────────────────────────────────────────────────────────

const DIGIT_COUNT       = 6
const RESEND_COOLDOWN   = 59   // seconds — matches "00:59" in design

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ForgotPasswordVerifyOtpScreen({
  navigation,
  route,
}: any) {
  const identifier: string = route?.params?.identifier ?? ''
  const isEmail:    boolean = !!route?.params?.isEmail
  const [sessionId, setSessionId] = useState<string>(
    route?.params?.sessionId ?? '',
  )

  const { mutate: verifyOtp,   isPending: isVerifying } = useForgotPasswordVerify()
  const { mutate: resendCode,  isPending: isResending  } = useForgotPasswordStart()

  // ── OTP digits state ───────────────────────────────────────────────────────
  const [digits,    setDigits]    = useState<string[]>(Array(DIGIT_COUNT).fill(''))
  const [otpError,  setOtpError]  = useState<string | undefined>()
  const inputRefs = useRef<(TextInput | null)[]>([])

  // ── Countdown timer ────────────────────────────────────────────────────────
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    clearTimer()
    setSeconds(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) { clearTimer(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  useEffect(() => {
    startTimer()
    return clearTimer
  }, [])

  // ── Digit input handlers ───────────────────────────────────────────────────
  const handleChange = (text: string, index: number) => {
    const char = text.replace(/[^0-9]/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setOtpError(undefined)
    if (char && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleContinue = () => {
    const code = digits.join('')
    if (code.length < DIGIT_COUNT) {
      setOtpError(`Please enter all ${DIGIT_COUNT} digits`)
      return
    }

    const payload = isEmail
      ? { sessionId, code, email: identifier }
      : { sessionId, code, phone: identifier }

    verifyOtp(payload, {
      onSuccess: (res) => {
        navigation.navigate('ResetPasswordScreen', {
          resetToken:  res.resetToken,
          identifier,
          isEmail,
        })
      },
      onError: (err: any) => {
        setOtpError(err?.message ?? 'Invalid or expired code')
      },
    })
  }

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResend = () => {
    if (seconds > 0 || isResending) return

    const payload = isEmail ? { email: identifier } : { phone: identifier }
    resendCode(payload as any, {
      onSuccess: (res: any) => {
        if (res?.sessionId) setSessionId(res.sessionId)
        setDigits(Array(DIGIT_COUNT).fill(''))
        setOtpError(undefined)
        inputRefs.current[0]?.focus()
        startTimer()
        showToast({ text1: 'Code resent' })
      },
      onError: (err: any) =>
        showToast({ text1: 'Could not resend code', text2: err?.message }),
    })
  }

  // ── Format timer ──────────────────────────────────────────────────────────
  const formatted = `00:${String(seconds).padStart(2, '0')}`

  return (
    <View style={styles.root}>
      <View style={styles.page}>

        {/* ── Back ──────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={sf(22)} color="#000000" strokeWidth={2} />
        </TouchableOpacity>

        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            We're sent a 6 digit verification code to:
          </Text>
          <Text style={styles.identifier}>{identifier}</Text>
        </View>

        {/* ── OTP boxes ─────────────────────────────────────────────── */}
        <View style={styles.otpRow}>
          {Array(DIGIT_COUNT).fill(null).map((_, i) => (
            <TextInput
              key={i}
              ref={(r) => { inputRefs.current[i] = r }}
              value={digits[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpCell,
                !!digits[i] && styles.otpCellFilled,
                !!otpError && !digits[i] && styles.otpCellError,
              ]}
            />
          ))}
        </View>

        <FieldError message={otpError} />

        {/* ── Timer ─────────────────────────────────────────────────── */}
        <Text style={styles.timer}>{formatted}</Text>

        {/* ── Resend row ────────────────────────────────────────────── */}
        <View style={styles.resendRow}>
          <Text style={styles.resendBase}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={seconds > 0 || isResending}
            activeOpacity={seconds > 0 ? 1 : 0.7}
          >
            <Text style={[
              styles.resendLink,
              seconds > 0 && styles.resendLinkDisabled,
            ]}>
              {isResending ? 'Sending…' : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Continue button ───────────────────────────────────────── */}
        <View style={{ marginTop: sh(32) }}>
          <PrimaryButton
            title={isVerifying ? 'Verifying…' : 'Continue'}
            onPress={handleContinue}
            colors={!identifier ? ['rgba(234,214,169,0.5)', 'rgba(234,214,169,0.5)'] : ['#EAD6A9', '#EAD6A9']}
            disabled={isVerifying || !identifier}
            variant="solid"
            style={{ alignSelf: 'stretch' }}
            textStyle={{ fontSize: sf(20), fontWeight: '500', lineHeight: sf(24) }}
            height={sh(56)}
          />
        </View>

        {/* ── Back to login ─────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SignInScreen')}
          style={styles.backToLogin}
        >
          <Text style={styles.backToLoginText}>Back to login</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#F7F3ED',
  },
  page: {
    flex:              1,
    paddingHorizontal: sw(20),
    paddingTop:        sh(56),
    paddingBottom:     sh(40),
  },
  backBtn: {
    width:          sw(32),
    height:         sw(32),
    justifyContent: 'center',
  },

  // Header
  headerBlock: {
    marginTop:    sh(28),
    marginBottom: sh(32),
    gap:          sh(8),
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   sf(28),
    fontWeight: '600',
    color:      '#000000',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(15),
    color:      '#7D858E',
  },
  identifier: {
    fontFamily: 'Poppins-Medium',
    fontSize:   sf(18),
    fontWeight: '600',
    color:      '#000000',
  },

  // OTP
  otpRow: {
    flexDirection:  'row',
    // justifyContent: 'space-between',
    gap:            sw(8),
    marginBottom:   sh(8),
  },
  otpCell: {
    // flex:            1,
    height:          sf(54),
    width:           sw(48),
    borderRadius:    sr(10),
    borderWidth:     1,
    borderColor:     '#EAD6A9',
    backgroundColor: '#FFFFFF',
    textAlign:       'center', 
    fontSize:        sf(24),
    lineHeight:        sf(24),
    fontFamily:      'Poppins-SemiBold',
    color:           '#000000',
  },
  otpCellFilled: {
    borderColor: '#CEB98F',
  },
  otpCellError: {
    borderColor: '#EF4444',
  },

  // Timer
  timer: {
    fontFamily:  'Poppins-SemiBold',
    fontSize:    sf(18),
    color:       '#0B0B0B',
    textAlign:   'center',
    marginTop:   sh(20),
    marginBottom: sh(12),
  },

  // Resend
  resendRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
  },
  resendBase: {
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(16),
    color:      '#7D858E',
  },
  resendLink: {
    fontFamily: 'Poppins-Medium',
    fontSize:   sf(16),
    color:      '#CEB98F',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: '#B6B9C9',
  },

  // Bottom
  backToLogin: {
    marginTop:  sh(20),
    alignItems: 'center',
  },
  backToLoginText: {
 fontFamily:          'Poppins-Medium',
    fontSize:            sf(16),
    color:               '#CEB98F',
    fontWeight:  '500',
    textDecorationLine:  'underline',
  },
})