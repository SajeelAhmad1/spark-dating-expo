import React, { useState } from 'react'
import {
  View, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native'
import { Text }       from '@/components/common/Text'
import {
  ChevronLeft, Lock, Eye, EyeOff,
  CheckCircle2, XCircle,
} from 'lucide-react-native'
import PrimaryButton  from '@/components/common/PrimaryButton'
import { sf, sw, sh, sr } from '@/utils/sizeMatters'
import { useZodForm } from '@/utils/form'
import { z }          from 'zod'
import { showToast }  from '@/utils/toast'
import { useForgotPasswordReset } from '@/features/auth/hooks'

// ── Schema ────────────────────────────────────────────────────────────────────

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[a-z]/, 'One lowercase letter')
      .regex(/[0-9]/, 'One number')
      .regex(/[^A-Za-z0-9]/, 'One special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>

// ── Password rules ────────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: 'At least 8 characters',  test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter',   test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter',   test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number',             test: (v: string) => /[0-9]/.test(v) },
  { label: 'One special character',  test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

function getStrength(password: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  if (passed <= 1) return { score: passed, label: 'Weak',   color: '#EF4444' }
  if (passed <= 3) return { score: passed, label: 'Fair',   color: '#F59E0B' }
  if (passed === 4) return { score: passed, label: 'Good',  color: '#3B82F6' }
  return               { score: passed, label: 'Strong', color: '#10B981' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PasswordInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  errorMessage,
  show,
  onToggle,
}: {
  label:        string
  value:        string
  onChangeText: (v: string) => void
  onBlur?:      () => void
  placeholder:  string
  errorMessage?: string
  show:         boolean
  onToggle:     () => void
}) {
  return (
    <View style={{ marginBottom: sh(4) }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, !!errorMessage && styles.inputRowError]}> 
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#7D858E"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {show
            ? <EyeOff size={sf(18)} color="#000000" />
            : <Eye    size={sf(18)} color="#000000" />
          }
        </TouchableOpacity>
      </View>
      {!!errorMessage && (
        <Text style={styles.fieldError}>{errorMessage}</Text>
      )}
    </View>
  )
}

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color } = getStrength(password)
  return (
    <View style={{ marginBottom: sh(16) }}>
      {/* Bar + label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(8), marginBottom: sh(10) }}>
        <View style={{ flex: 1, flexDirection: 'row', gap: sw(4) }}>
          {PASSWORD_RULES.map((_, i) => (
            <View
              key={i}
              style={{
                flex:            1,
                height:          sh(4),
                borderRadius:    sf(4),
                backgroundColor: i < score ? color : '#E5E7EB',
              }}
            />
          ))}
        </View>
        <Text style={{ fontSize: sf(12), fontWeight: '600', color, minWidth: sw(44), textAlign: 'right' }}>
          {label}
        </Text>
      </View>
      {/* Rule list */}
      <View style={{ gap: sh(4) }}>
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password)
          return (
            <View key={rule.label} style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6) }}>
              {passed
                ? <CheckCircle2 size={sf(13)} color="#10B981" />
                : <XCircle      size={sf(13)} color="#D1D5DB" />
              }
              <Text style={{ fontSize: sf(12), color: passed ? '#10B981' : '#9CA3AF' }}>
                {rule.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ResetPasswordScreen({ navigation, route }: any) {
  const resetToken: string  = route?.params?.resetToken  ?? ''
  const identifier: string  = route?.params?.identifier  ?? ''
  const isEmail:    boolean = !!route?.params?.isEmail

  const { mutate: resetPassword, isPending } = useForgotPasswordReset()

  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { watch, setValue, handleSubmit, trigger, formState } = useZodForm(
    resetSchema,
    { defaultValues: { newPassword: '', confirmPassword: '' }, mode: 'onBlur' },
  )

  const { errors }        = formState
  const newPassword       = watch('newPassword')
  const confirmPassword   = watch('confirmPassword')
  const passwordsMatch    = newPassword.length > 0 && newPassword === confirmPassword

  const onValid = (data: ResetForm) => {
    if (!resetToken) {
      showToast({ text1: 'Session expired', text2: 'Please start over.' })
      navigation.navigate('ForgotPasswordScreen')
      return
    }

    resetPassword(
      { resetToken, newPassword: data.newPassword },
      {
        onSuccess: () => {
          showToast({ text1: 'Password reset successfully!' })
          navigation.replace('PasswordUpdatedScreen')
        },
        onError: (err: any) =>
          showToast({ text1: 'Reset failed', text2: err?.message }),
      },
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F7F3ED' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.page}>

            {/* ── Back ──────────────────────────────────────────────── */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={sf(22)} color="#000000" strokeWidth={2} />
            </TouchableOpacity>

            {/* ── Header ────────────────────────────────────────────── */}
            <View style={styles.headerBlock}>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>
                Please enter your new password
                <Text style={{ color: '#CEB98F', fontFamily: 'Poppins-Medium' }}>
                  {identifier}
                </Text>
              </Text>
            </View>

            {/* ── Fields ────────────────────────────────────────────── */}
            <View style={{ gap: sh(12) }}>

              <PasswordInput
                label="New Password"
                value={newPassword}
                onChangeText={(v) => setValue('newPassword', v, { shouldValidate: true })}
                onBlur={() => trigger('newPassword')}
                placeholder="********"
                errorMessage={errors.newPassword?.message}
                show={showNew}
                onToggle={() => setShowNew((p) => !p)}
              />

              <StrengthMeter password={newPassword} />

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={(v) => setValue('confirmPassword', v, { shouldValidate: true })}
                onBlur={() => trigger('confirmPassword')}
                placeholder="********"
                errorMessage={errors.confirmPassword?.message}
                show={showConfirm}
                onToggle={() => setShowConfirm((p) => !p)}
              />

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: sw(6), marginBottom: sh(8) }}>
                  {passwordsMatch
                    ? <>
                        <CheckCircle2 size={sf(13)} color="#10B981" />
                        <Text style={{ fontSize: sf(12), color: '#10B981', fontWeight: '500' }}>
                          Passwords match
                        </Text>
                      </>
                    : <>
                        <XCircle size={sf(13)} color="#EF4444" />
                        <Text style={{ fontSize: sf(12), color: '#EF4444' }}>
                          Passwords don't match
                        </Text>
                      </>
                  }
                </View>
              )}

            </View>

            {/* ── Submit ────────────────────────────────────────────── */}
            <View style={{ marginTop: sh(28) }}>
              <PrimaryButton
                title={isPending ? '' : 'Reset Password'}
                icon={isPending
                  ? <ActivityIndicator size="small" color="#000000" />
                  : undefined
                }
                iconPosition="middle"
                onPress={handleSubmit(onValid)}
                disabled={isPending} 
                variant="solid"
                style={{ alignSelf: 'stretch' }}
               textStyle={{ fontSize: sf(20), fontWeight: '500', lineHeight: sf(24) }}
                height={sh(56)}
              />
            </View>

            {/* ── Back to login ─────────────────────────────────────── */}
            <TouchableOpacity
              onPress={() => navigation.navigate('SignInScreen')}
              style={styles.backToLogin}
            >
              <Text style={styles.backToLoginText}>Back to login</Text>
            </TouchableOpacity>

          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    gap:          sh(10),
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
    lineHeight: sf(22),
  },

  // Input
  fieldLabel: {
    fontFamily:   'Poppins-Medium',
    fontSize:     sf(18),
    fontWeight:   '600',
    color:        '#000000',
    // marginBottom: sh(8),
  },
  inputRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             sw(10),
    // backgroundColor: '#FFFFFF',
    // borderWidth:     1,
    borderBottomWidth: 1,
    borderColor:     '#B6B9C9',
    // borderRadius:    sr(12),
    // paddingHorizontal: sw(14),
    height:          sh(48),
    // marginBottom:    sh(4),
  },
  inputRowError: {
    borderColor: '#EF4444',
  },
  textInput: {
    flex:       1,
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(16),
    color:      '#000000',
    padding:    0,
  },
  fieldError: {
    fontSize:    sf(12),
    color:       '#EF4444',
    marginTop:   sh(2),
    marginLeft:  sw(4),
    marginBottom: sh(4),
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