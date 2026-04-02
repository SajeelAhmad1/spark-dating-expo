import { sf, sh, sw } from '@/utils/sizeMatters';
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {Text} from '@/components/common/Text'

// ─── Types ────────────────────────────────────────────────
type ButtonVariant = 'gradient' | 'solid' | 'outline';
type IconPosition = 'start' | 'middle' | 'end';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  colors: string[];
  iconBackground?: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  height?: number;
  borderRadius?: number;
  paddingHorizontal?: number;
}

// ─── Component ────────────────────────────────────────────
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  colors,
  iconBackground,
  variant = 'gradient',
  icon,
  iconPosition = 'start',
  loading = false,
  disabled = false,
  style,
  textStyle,
  height = 56,
  borderRadius = 28,
  paddingHorizontal,
}) => {

  // ── Icon wrapped with optional iconBackground ring ──
  const renderIcon = () => {
    if (!icon) return null;

    if (iconBackground) {
      return (
        <View
          style={{
            width: sw(48),
            height: sh(48),
            borderRadius: 999,
            backgroundColor: iconBackground,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      );
    }

    return icon;
  };

  // ── Inner content layout ──
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color="#fff" />;
    }

    // Middle: icon + text side by side, both centered
    if (icon && iconPosition === 'middle') {
      return (
        <View style={[styles.row, paddingHorizontal !== undefined && { paddingHorizontal }]} >
          <View style={styles.iconMiddle}>{renderIcon()}</View>
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      );
    }

    // Start / End: icon is absolute, text stays centered
    return (
      <View style={[styles.row, paddingHorizontal !== undefined && { paddingHorizontal }]}>
        {icon && iconPosition === 'start' && (
          <View style={styles.iconAbsoluteStart}>{renderIcon()}</View>
        )}
        <Text style={[styles.text, textStyle]}>{title}</Text>
        {icon && iconPosition === 'end' && (
          <View style={styles.iconAbsoluteEnd}>{renderIcon()}</View>
        )}
      </View>
    );
  };

  // ── Outline variant ──
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.outlineButton,
          { height, borderRadius, borderColor: colors[0] },
          paddingHorizontal !== undefined && { paddingHorizontal },
          disabled && styles.disabled,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // ── Gradient or Solid variant ──
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={variant === 'solid' ? [colors[0], colors[0]] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { height, borderRadius },
          paddingHorizontal !== undefined && { paddingHorizontal },
        ]} 
      >
        {renderContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: sf(16),
  },
  iconAbsoluteStart: {
    position: 'absolute',
    left: sw(7),
  },
  iconAbsoluteEnd: {
    position: 'absolute',
    right: sw(16),
  },
  iconMiddle: {
    marginRight: sw(8),
  },
  disabled: { opacity: 0.5 },
});

export default PrimaryButton;
