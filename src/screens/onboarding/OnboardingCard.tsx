import React from "react";
import { View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import PrimaryButton from "@/components/common/PrimaryButton";
import { Colors } from "@/theme";
import { sf, sw, sh, sr } from "@/utils/responsive";
import { Text } from "@/components/common/Text";

interface Props {
  title: string;
  subtitle: string;
  activeDot: 0 | 1 | 2;
  buttonLabel: string;
  onPress: () => void;
}

const OnboardingCard: React.FC<Props> = ({
  title,
  subtitle,
  activeDot,
  buttonLabel,
  onPress,
}) => {
  return (
    <Shadow
      distance={sh(10)}
      offset={[0, 0]}
      endColor="rgba(0,0,0,0)"
      sides={{ top: true, bottom: false, start: false, end: false }}
      style={{ width: "100%" }}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: sr(32),
          borderTopRightRadius: sr(32),
          paddingTop: sh(40),
          paddingBottom: sh(32),
          minHeight: sh(362),
        }}
      >
        <View style={{ width: "100%" }}>
          {/* Title */}
          <Text
            weight="semibold"
            style={{
              textAlign: "center",
              color: "#000000",
              paddingHorizontal: sw(24),
              marginBottom: sh(8),
              fontSize: sf(24),  
            }}
          >
            {title}
          </Text>

          {/* Subtitle */}
          <Text
            weight="regular"
            style={{
              color: "#7D858E",
              textAlign: "center",
              paddingHorizontal: sw(40),
              fontSize: sf(16), 
              height: sf(80),
            }}
          >
            {subtitle}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {/* Dots */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: sh(20),
              gap: sw(6),
            }}
          >
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  height: sh(8),
                  width: i === activeDot ? sw(24) : sw(8),
                  borderRadius: sr(4),
                  backgroundColor: i === activeDot ? "#1E78F5" : "#B6B9C9",
                }}
              />
            ))}
          </View>

          {/* Button */}
          <View style={{ paddingHorizontal: sw(20) }}>
            <PrimaryButton
              title={buttonLabel}
              onPress={onPress}
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              textStyle={{
                fontSize: sf(18), 
              }}
            />
          </View>
        </View>
      </View>
    </Shadow>
  );
};

export default OnboardingCard;
