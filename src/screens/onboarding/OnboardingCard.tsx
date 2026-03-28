import React from "react";
import { View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import PrimaryButton from "@/components/common/PrimaryButton";
import { Colors } from "@/theme";
import { sf } from "@/utils/responsive";
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
      distance={10}
      offset={[0, 0]}
      endColor="rgba(0,0,0,0)"
      sides={{ top: true, bottom: false, start: false, end: false }}
      style={{ width: "100%" }}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingTop: 40,
          paddingBottom: 32,
          minHeight: 300,
        }}
      >
        <View style={{ width: "100%" }}>
          {/* Title */}
          <Text
            weight="semibold"
            style={{
              textAlign: "center",
              color: "#000000",
              paddingHorizontal: 24,
              marginBottom: 8,
              fontSize: sf(24),
              lineHeight: sf(32),
              letterSpacing: 0,
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
              paddingHorizontal: 40,
              fontSize: sf(16),
              lineHeight: sf(20),
              letterSpacing: 0,
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
              marginBottom: 20,
              gap: 6,
            }}
          >
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  height: 8,
                  width: i === activeDot ? 24 : 8,
                  borderRadius: 4,
                  backgroundColor: i === activeDot ? "#1E78F5" : "#B6B9C9",
                }}
              />
            ))}
          </View>

          {/* Button */}
          <View style={{ paddingHorizontal: 20 }}>
            <PrimaryButton
              title={buttonLabel}
              onPress={onPress}
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              textStyle={{
                fontSize: sf(18),
                lineHeight: sf(18),
                letterSpacing: 0,
              }}
            />
          </View>
        </View>
      </View>
    </Shadow>
  );
};

export default OnboardingCard;
