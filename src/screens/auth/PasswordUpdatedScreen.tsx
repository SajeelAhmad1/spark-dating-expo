import React, { useEffect, useRef } from 'react'
import {
  View, TouchableOpacity, StyleSheet, Animated,
} from 'react-native'
import { Text }      from '@/components/common/Text'
import { Check }     from 'lucide-react-native'
import PrimaryButton from '@/components/common/PrimaryButton'
import { sf, sw, sh, sr } from '@/utils/sizeMatters'

export default function PasswordUpdatedScreen({ navigation }: any) {
  // ── Entrance animation ────────────────────────────────────────────────────
  const scale   = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue:     1,
        useNativeDriver: true,
        tension:     60,
        friction:    7,
      }),
      Animated.timing(opacity, {
        toValue:         1,
        duration:        400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.card, { opacity }]}>

        {/* ── Check circle ──────────────────────────────────────────── */}
        <Animated.View style={[styles.circleWrap, { transform: [{ scale }] }]}>
          <View style={styles.circle}>
            <Check size={sf(36)} color="#28C76F" strokeWidth={2.5} />
          </View>
        </Animated.View>

        {/* ── Text ──────────────────────────────────────────────────── */}
        <Text style={styles.title}>Password Updated!</Text>
        <Text style={styles.subtitle}>
          Your password has been changed{'\n'}successfully.
        </Text>

        {/* ── Continue ──────────────────────────────────────────────── */}
        <View style={styles.btnWrap}>
          <PrimaryButton
            title="Continue"
            onPress={() => navigation.replace('SignInScreen')}
            variant="solid"
            style={{ alignSelf: 'stretch' }}
            textStyle={{ fontSize: sf(20), fontWeight: '500', lineHeight: sf(24) }}
            height={sh(56)}
          />
        </View>

        {/* ── Back to login ─────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.replace('SignInScreen')}
          style={styles.backToLogin}
        >
          <Text style={styles.backToLoginText}>Back to login</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#F7F3ED',
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: sw(20),
  },
  card: {
    width:      '100%',
    alignItems: 'center',
    gap:        sh(0),
  },

  // Circle
  circleWrap: {
    marginBottom: sh(32),
  },
  circle: {
    width:           sf(100),
    height:          sf(100),
    borderRadius:    sf(50),
    borderWidth:     2.5,
    borderColor:     '#28C76F',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'transparent',
  },

  // Text
  title: {
    
    textAlign:    'center',
    marginBottom: sh(12),
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
    textAlign:    'center', 
    marginBottom: sh(40),
  },

  // Buttons
  btnWrap: {
    width:        '100%',
    marginBottom: sh(16),
  },
  backToLogin: {
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