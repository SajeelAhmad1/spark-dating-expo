import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { ToastConfig } from "react-native-toast-message";
import type { LucideIcon } from "lucide-react-native";
import { X, Zap } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { sh, sr, sw } from "./sizeMatters";

type ToastProps = {
  text1?: string;
  text2?: string;
  hide: () => void;
  props: { icon?: LucideIcon };
};

const ToastContent = ({
  text1,
  text2,
  hide,
  props,
  toastStyle,
  iconWrapStyle,
}: ToastProps & { toastStyle?: object; iconWrapStyle?: object }) => {
  const Icon = props?.icon ?? Zap;

  return (
    <LinearGradient
      colors={["#FBB202", "#DC9B00"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.toast, toastStyle]}
    >
      <View style={[styles.iconWrap, iconWrapStyle]}>
        <Icon size={22} color="#1E78F5" fill="#1E78F5" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
      </View>
      <TouchableOpacity style={styles.closeWrap} onPress={hide}>
        <X size={16} color="#000" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export const toastConfig: ToastConfig = {
  success: (p) => <ToastContent {...(p as any)} />,
  error: (p) => (
    <ToastContent
      {...(p as any)}
      toastStyle={styles.errorToast}
      iconWrapStyle={styles.errorIconWrap}
    />
  ),
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBB202",
    borderRadius: sr(20),
    paddingHorizontal: sw(12),
    marginHorizontal: sw(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: sr(10),
    elevation: 6,
    minHeight: sh(80),
    justifyContent: "center"
  },
  errorToast: {
    backgroundColor: "#FF4D4F",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 13,
  },
  errorIconWrap: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 16,
  },
  subtitle: {
    color: "#555555",
    fontWeight: "400",
    fontSize: 13,
    marginTop: 2,
    opacity: 0.75,
  },
  closeWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
