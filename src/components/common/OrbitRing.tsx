// components/common/OrbitRing.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

export interface OrbitRingProps {
  /** Outer diameter of the ring in pixels */
  size: number
  /** Full rotation duration in ms */
  duration: number
  /** First arc colour (any CSS/RN colour string) */
  color1: string
  /** Second arc colour */
  color2: string
  /** Optional third arc colour — when provided, three equal arcs are drawn */
  color3?: string
  /** Stroke width of the arcs (default: 1.5) */
  strokeWidth?: number
  /** Animation start delay in ms (default: 0) */
  delay?: number
  /** Spin counter-clockwise when true (default: false) */
  reverse?: boolean
}

/**
 * OrbitRing
 *
 * Draws 2–3 evenly-spaced arc segments on a circle and rotates them
 * continuously. Drop multiple rings centred on the same point for the
 * classic "orbit radar" effect used in SearchScreen and DiscoveryScreen.
 *
 * Usage:
 *   <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
 *     <OrbitRing size={300} duration={7000} color1="#1E78F540" color2="#FBB20240" />
 *     <OrbitRing size={245} duration={6000} color1="#FBB20240" color2="#1E78F540" color3="#FBB20240" strokeWidth={4} delay={150} reverse />
 *   </View>
 */
const OrbitRing: React.FC<OrbitRingProps> = ({
  size,
  duration,
  color1,
  color2,
  color3,
  strokeWidth = 1.5,
  delay = 0,
  reverse = false,
}) => {
  const rotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [duration, delay, rotation])

  const rotate = rotation.interpolate({
    inputRange:  [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  })

  const r            = size / 2 - strokeWidth
  const circumference = 2 * Math.PI * r
  const arcCount     = color3 ? 3 : 2
  const arc          = circumference * 0.22
  const gap          = (circumference - arc * arcCount) / arcCount

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate }],
      }}
    >
      <Svg width={size} height={size}>
        {/* Arc 1 */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color1}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        {/* Arc 2 */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color2}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset={-(arc + gap)}
          strokeLinecap="round"
        />
        {/* Arc 3 (optional) */}
        {color3 && (
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color3}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference - arc}`}
            strokeDashoffset={-(arc * 2 + gap * 2)}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </Animated.View>
  )
}

export default OrbitRing