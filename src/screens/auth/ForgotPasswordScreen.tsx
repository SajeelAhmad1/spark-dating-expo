import React, { useState } from 'react'
import {
  View, TouchableOpacity, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { Text }       from '@/components/common/Text'
import { ChevronLeft, Phone, Mail } from 'lucide-react-native'
import PrimaryButton  from '@/components/common/PrimaryButton'
import { FieldError } from '@/components/common/FieldError'
import { sf, sw, sh, sr } from '@/utils/sizeMatters'
import { useZodForm } from '@/utils/form'
import { z }          from 'zod'
import { showToast }  from '@/utils/toast'
import { useForgotPasswordStart } from '@/features/auth/hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'phone' | 'email'

// ── Schemas ───────────────────────────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
})
const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('phone')
  const { mutate: startReset, isPending } = useForgotPasswordStart()

  // ── Phone form ─────────────────────────────────────────────────────────────
  const phoneForm = useZodForm(phoneSchema, { defaultValues: { phone: '' } })
  const emailForm = useZodForm(emailSchema, { defaultValues: { email: '' } })

  const phoneVal  = phoneForm.watch('phone')
  const emailVal  = emailForm.watch('email')

  const handleContinue = () => {
    if (activeTab === 'phone') {
      phoneForm.handleSubmit((data) => {
        startReset(
          { phone: data.phone },
          {
            onSuccess: (res) => {
              navigation.navigate('ForgotPasswordVerifyOtpScreen', {
                identifier: data.phone,
                isEmail:    false,
                sessionId:  res.sessionId,
              })
            },
            onError: (err: any) =>
              showToast({ text1: 'Failed to send code', text2: err?.message }),
          },
        )
      })()
    } else {
      emailForm.handleSubmit((data) => {
        startReset(
          { email: data.email },
          {
            onSuccess: (res) => {
              navigation.navigate('ForgotPasswordVerifyOtpScreen', {
                identifier: data.email,
                isEmail:    true,
                sessionId:  res.sessionId,
              })
            },
            onError: (err: any) =>
              showToast({ text1: 'Failed to send code', text2: err?.message }),
          },
        )
      })()
    }
  }

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    phoneForm.reset()
    emailForm.reset()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.root}>
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
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered phone number or email to receive a verification code.
              </Text>
            </View>

            {/* ── Tabs ──────────────────────────────────────────────── */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                onPress={() => switchTab('phone')}
                style={styles.tabItem}
              >
                <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
                  Phone number
                </Text>
                {activeTab === 'phone' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => switchTab('email')}
                style={styles.tabItem}
              >
                <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                  Email
                </Text>
                {activeTab === 'email' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            </View>

            {/* ── Input ─────────────────────────────────────────────── */}
            {activeTab === 'phone' ? (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Phone number</Text>
                <View style={[
                  styles.inputRow,
                  !!phoneForm.formState.errors.phone && styles.inputRowError,
                ]}>
                  <Phone size={sf(24)} color="#7D858E"  />
                  <TextInput
                    value={phoneVal}
                    onChangeText={(v) =>
                      phoneForm.setValue('phone', v, { shouldValidate: true })
                    }
                    onBlur={() => phoneForm.trigger('phone')}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#7D858E"
                    keyboardType="phone-pad"
                    style={styles.textInput}
                  />
                </View>
                <FieldError message={phoneForm.formState.errors.phone?.message} />
              </View>
            ) : (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Email address</Text>
                <View style={[
                  styles.inputRow,
                  !!emailForm.formState.errors.email && styles.inputRowError,
                ]}>
                  <Mail size={sf(24)} color="#7D858E" />
                  <TextInput
                    value={emailVal}
                    onChangeText={(v) =>
                      emailForm.setValue('email', v, { shouldValidate: true })
                    }
                    onBlur={() => emailForm.trigger('email')}
                    placeholder="Enter your email address"
                    placeholderTextColor="#B6B9C9"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
                <FieldError message={emailForm.formState.errors.email?.message} />
              </View>
            )}

            {/* ── Continue button ───────────────────────────────────── */}
            <View style={{ marginTop: sh(32) }}>
              <PrimaryButton
                title={isPending ? 'Sending…' : 'Continue'}
                onPress={handleContinue}
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
      </View>
    </KeyboardAvoidingView>
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
    width:  sw(32),
    height: sw(32),
    justifyContent: 'center',
  },

  // Header
  headerBlock: {
    marginTop:    sh(28),
    marginBottom: sh(28),
    gap:          sh(10),
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize:   sf(28),
    fontWeight: '600',
    color:      '#000000',
  },
  subtitle: {
    fontFamily:  'Poppins-Regular',
    fontSize:    sf(15),
    color:       '#7D858E',
    lineHeight:  sf(21),
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    marginBottom:  sh(24),
    gap:           sw(24),
  },
  tabItem: {
    paddingBottom: sh(8),
    alignItems:    'center',
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    fontSize:   sf(18),
    color:      '#7D858E',
  },
  tabTextActive: {
    color:      '#CEB98F',
    fontFamily: 'Poppins-Medium',
  },
  tabUnderline: {
    position:        'absolute',
    bottom:          8,
    left:            0,
    right:           0,
    height:          sh(2),
    backgroundColor: '#CEB98F',
    borderRadius:    999,
  },

  // Input
  inputBlock: {
    gap: sh(6),
  },
  inputLabel: {
    fontFamily:  'Poppins-Medium',
    fontSize:    sf(18),
    fontWeight:  '600',
    color:       '#000000',
    marginBottom: sh(4),
  },
  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               sw(10),
    borderBottomWidth: sh(1),
    borderBottomColor: '#D0C9BE',
    paddingVertical:   sh(12),
  },
  inputRowError: {
    borderBottomColor: '#EF4444',
  },
  textInput: {
    flex:       1,
    fontFamily: 'Poppins-Regular',
    fontSize:   sf(12),
    color:      '#000000',
    padding:    0,
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