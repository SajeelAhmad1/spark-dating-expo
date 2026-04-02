import React, { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Text } from "@/components/common/Text";
import { UserCircle, AlertTriangle } from "lucide-react-native";
import { sf, sw, sh } from "@/utils/sizeMatters";

export type ChatMenuItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onPress: () => void;
};

type ChatMenuProps = {
  visible: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number; width: number; height: number } | null;
  items?: ChatMenuItem[];
};

const DEFAULT_ITEMS = (onViewProfile: () => void, onBlock: () => void): ChatMenuItem[] => [
  {
    key: "view_profile",
    label: "View Profile",
    icon: <UserCircle size={sf(18)} color="#1C1C1E" strokeWidth={1.8} />,
    color: "#1C1C1E",
    onPress: onViewProfile,
  },
  {
    key: "block",
    label: "Block",
    icon: <AlertTriangle size={sf(18)} color="#FBB202" strokeWidth={1.8} />,
    color: "#FBB202",
    onPress: onBlock,
  },
];

export default function ChatMenu({
  visible,
  onClose,
  anchorPosition,
  items,
}: ChatMenuProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Track which item is currently pressed
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const menuItems: ChatMenuItem[] = items ?? DEFAULT_ITEMS(
    () => { onClose(); },
    () => { onClose(); }
  );

  useEffect(() => {
    if (visible) {
      // Reset pressed state each time menu opens
      setPressedKey(null);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 18,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!anchorPosition) return null;

  const MENU_WIDTH = sw(180);
  const menuTop = anchorPosition.y + anchorPosition.height + sh(50);
  const screenWidth = Dimensions.get("window").width;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  top: menuTop,
                  right: sw(30),
                  width: MENU_WIDTH,
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {menuItems.map((item, index) => {
                const isPressed = pressedKey === item.key;

                return (
                  <React.Fragment key={item.key}>
                    <TouchableOpacity
                      style={[
                        styles.menuItem,
                        // Highlight the pressed row
                        isPressed && styles.menuItemPressed,
                        // Round top corners for first item, bottom for last
                        index === 0 && styles.menuItemFirst,
                        index === menuItems.length - 1 && styles.menuItemLast,
                      ]}
                      onPressIn={() => setPressedKey(item.key)}
                      onPressOut={() => setPressedKey(null)}
                      onPress={() => {
                        onClose();
                        item.onPress();
                      }}
                      activeOpacity={1}
                    >
                      {item.icon && (
                        <View style={styles.iconWrapper}>
                          {/* Swap icon color to #1E78F5 when pressed */}
                          {isPressed
                            ? React.isValidElement(item.icon)
                              ? React.cloneElement(item.icon as React.ReactElement<any>, { color: "#1E78F5" })
                              : item.icon
                            : item.icon}
                        </View>
                      )}
                      <Text
                        style={[
                          styles.menuLabel,
                          { color: isPressed ? "#1E78F5" : (item.color ?? "#1C1C1E") },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity> 
                  </React.Fragment>
                );
              })}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: sh(8),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    transformOrigin: "top right",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    gap: sw(10),
    minHeight: sh(44),
    backgroundColor: "transparent",
  },
  menuItemPressed: {
    backgroundColor: "rgba(30, 120, 245, 0.15)",
  },
  menuItemFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  menuItemLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  iconWrapper: {
    width: sf(20),
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { 
    fontWeight: "400",
    fontSize: sf(16),
  },
  divider: {
    height: 0.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: sw(16),
  },
});