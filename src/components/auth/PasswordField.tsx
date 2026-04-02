import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { sf, sh, sw } from "@/utils/sizeMatters";
import { Text } from "../common/Text";
import { FieldError } from "@/components/common/FieldError";

export default function PasswordField({
  password,
  onChangeText,
  onBlur,
  showPassword,
  onToggleShowPassword,
  errorMessage,
}: {
  password: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  errorMessage?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontSize: sf(18) }]} weight="semibold">
        Password
      </Text>
      <View style={styles.fieldRow}>
        <TextInput
          placeholder="••••••••••••"
          placeholderTextColor="#7D858E"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={onChangeText}
          onBlur={onBlur}
          style={[styles.input, { fontSize: sf(12), paddingVertical: sh(8) }]}
        />
        <TouchableOpacity
          onPress={onToggleShowPassword}
          style={{ paddingLeft: sw(8) }}
        >
          {showPassword ? (
            <Eye size={sf(20)} color="#7D858E" />
          ) : (
            <EyeOff size={sf(20)} color="#7D858E" />
          )}
        </TouchableOpacity>
      </View>
      <FieldError message={errorMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { rowGap: 8, paddingTop: 16 },
  label: { color: "#000000" },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#B6B9C9",
  },
  input: {
    flex: 1,
    color: "#7D858E",
  },
});
