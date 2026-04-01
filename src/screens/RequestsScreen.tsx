import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Text } from "@/components/common/Text";
import { ChevronLeft } from "lucide-react-native";
import { REQUESTS } from "@/constants/requests";
import RequestCard from "@/components/requests/RequestCard";
import BottomTabBar from "@/components/common/BottomTabBar"; 
import { sf, sh, sw } from "@/utils/responsive";

export default function RequestsScreen({navigation}:any) {
 

  return (
    <View style={styles.safeArea}>
        <TouchableOpacity
        style={{
          paddingHorizontal: sw(16),
          paddingTop: sh(12),
          paddingBottom: sh(4),
        }}
      >
        <ChevronLeft size={22} color="#000" />
      </TouchableOpacity>

      <View
        style={[
          styles.headerRow,
          { paddingHorizontal: sw(16), marginBottom: sh(20), marginTop: sh(4) },
        ]}
      >
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            fontSize: sf(28),
            color: "#000000",
          }}
        >
          New Matches
        </Text>

        <View style={[styles.badge, { backgroundColor: "#FBB202" }]}>
          <Text
            style={{
              fontFamily: "Poppins-SemiBold",
              fontSize: sf(13),
              color: "#000000",
              textAlign: "center",
            }}
          >
            {String(REQUESTS.length).padStart(2, "0")}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.flex1}
        contentContainerStyle={{ paddingBottom: sh(140) }}
      >
        {REQUESTS.map((request) => (
          <RequestCard
            key={request.id}
            name={request.name}
            avatar={request.avatar}
            navigation={navigation}
          />
        ))}
      </ScrollView>

      <BottomTabBar />
      </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: sh(72), backgroundColor: "#FFFFFF", paddingBottom: sh(20) },
  flex1: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", columnGap: sw(8) },
  badge: {
    borderRadius: 9999,
    height: sh(28),
    width: sw(28),
    alignItems: "center",
    justifyContent: "center",
  },
});
