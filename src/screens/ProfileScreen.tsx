import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { Text } from "@/components/common/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings,
  Edit2,
  Bell,
  MapPin,
  ChevronRight,
  Venus,
} from "lucide-react-native";
import BottomTabBar from "@/components/common/BottomTabBar";
import { sf, sr, sw, sh } from "@/utils/sizeMatters";

// ── Profile Screen ─────────────────────────────────────────
const ProfileScreen = ({ navigation }: any) => {
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* ── Full Screen Background Gradient ── */}
      <LinearGradient
        colors={["#1E78F5", "#FBB202"]}
        start={{ x: 0, y: -0.1 }}
        end={{ x: 2, y: 0.7 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View style={styles.flex1}>
        {/* ── Header ── */}
        <LinearGradient
          colors={["#1E78F5", "#FBB202"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 9 }}
          style={{
            borderBottomWidth: 1,
            borderTopWidth: 0,
            borderBottomColor: "rgba(255,255,255,0.2)",
            shadowColor: "#000000",
            shadowOpacity: 0.032,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: sw(20),
              paddingTop: sh(12),
              marginTop: sh(60),
              paddingBottom: sh(16),
            }}
          >
            {/* Left: Edit Icon */}
            <View style={{ width: sf(36), alignItems: "flex-start" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditProfileScreen")}
                style={{
                  width: sf(36),
                  height: sf(36),
                  borderRadius: sr(92),
                  backgroundColor: "#FBB20233",
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: "#FFFFFF",
                  borderWidth: 1,
                }}
              >
                <Edit2 size={sf(20)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Center: Profile Text */}
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{ color: "#FFF", fontSize: sf(20), fontWeight: "600" }}
              >
                Profile
              </Text>
            </View>

            {/* Right: Settings Icon */}
            <View style={{ width: sf(36), alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("SettingsScreen")}
                style={{
                  width: sf(36),
                  height: sf(36),
                  borderRadius: sr(92),
                  backgroundColor: "background: rgba(251, 178, 2, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: "#FFFFFF",
                  borderWidth: 1,
                }}
              >
                <Settings size={sf(20)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Scrollable Content ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sh(20) }}
        >
          {/* ── Main Profile Image ── */}
          <View
            style={{
              marginHorizontal: sw(12),
              marginTop: sh(16),
              borderRadius: sr(16),
              overflow: "hidden",
              height: sh(535),
              borderWidth: 1,
              borderColor: "#FFFFFF",
              shadowColor: "#000000",
              shadowOpacity: 0.15,
              shadowRadius: 25,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
            }}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />

            {/* ── Name/Location Banner ── */}
            <View
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                right: 10,
                height: 70,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                paddingHorizontal: sw(16),
                borderColor: "#FFFFFF",
                borderRadius: sr(12),
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: sf(20),
                  color: "#FFFFFF",
                }}
              >
                Paul W (27)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Location */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: sw(4),
                  }}
                >
                  <MapPin size={sf(14)} color="#FFFFFF" />
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: sf(16),
                      color: "#FFFFFF",
                    }}
                  >
                    New York, USA
                  </Text>
                </View>
                {/* Gender */}
                <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4
                }}
                >
                  <Venus size={sf(16)} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: sf(16),
                    color: "#FFFFFF",
                  }}
                >
                  Woman
                </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Two Small Images ── */}
          <View
            style={{
              flexDirection: "row",
              gap: sw(10),
              marginHorizontal: sw(12),
              marginTop: sh(10),
            }}
          >
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
            ].map((uri, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: sh(220),
                  borderRadius: sr(14),
                  overflow: "hidden",
                  shadowColor: "#000000",
                  borderWidth: 1,
                  borderColor: "#FFFFFF",
                  shadowOpacity: 0.15,
                  shadowRadius: 25,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 8,
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>

          {/* ── Cards Container ── */}
          <View
            style={{ marginHorizontal: sw(12), marginTop: sh(20), gap: sh(18) }}
          >
            {/* ── Invite Friends Card ── */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: sr(12),
                paddingHorizontal: sw(16),
                // paddingVertical: sh(20),
                shadowColor: "#000000",
                shadowOpacity: 0.09,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: 0 },
                elevation: 5,
              }}
            >
              {premiumUnlocked ? (
                // ── Premium Unlocked State ──
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 79,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: sw(16),
                      flex: 1,
                    }}
                  >
                    {/* Crown Icon Container */}
                    <View
                      style={{
                        width: sf(40),
                        height: sf(40),
                        borderRadius: sr(92),
                        backgroundColor: "#FBB20233",
                        borderWidth: 0.4,
                        borderColor: "#DC9B00",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: sf(20) }}>👑</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Poppins-SemiBold",
                          fontSize: sf(15),
                          color: "#000000",
                        }}
                      >
                        Premium Unlocked! ⭐
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Poppins-Regular",
                          fontSize: sf(13),
                          color: "#555555",
                          // marginTop: sh(8),
                        }}
                      >
                        You've earned free Premium
                      </Text>
                    </View>
                  </View>

                  {/* Green Checkmark */}
                  <View
                    style={{
                      width: sf(32),
                      height: sf(32),
                      borderRadius: sr(92),
                      borderWidth: 2,
                      borderColor: "#22C55E",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#22C55E",
                        fontSize: sf(16),
                        fontWeight: "700",
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                </View>
              ) : (
                // ── Default State ──
                <TouchableOpacity
                  onPress={() => setPremiumUnlocked(true)}
                  activeOpacity={0.8}
                  style={{
                    minHeight: 106,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: sh(14),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: sw(20),
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          width: sw(40),
                          height: sh(40),
                          borderRadius: sr(92),
                          backgroundColor: "#FBB20233",
                          borderWidth: 0.4,
                          borderColor: "#DC9B00",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Bell
                          width={sw(18)}
                          height={sh(20)}
                          size={sf(18)}
                          color="#DC9B00"
                          strokeWidth={1.5}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: "Poppins-SemiBold",
                            fontSize: sf(15),
                            color: "#000000",
                          }}
                        >
                          Invite Friends, Get Premium Free!
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Poppins-Regular",
                            fontSize: sf(13),
                            color: "#555555",
                            // marginTop: sh(8),
                          }}
                        >
                          0 of 2 friends invited
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={sf(20)} color="#555555" />
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={{
                      // marginTop: sh(10),
                      flexDirection: "row",
                      gap: sw(6),
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        height: sh(10),
                        backgroundColor: "#EDEDED",
                        borderRadius: sr(99),
                        width: "49%",
                      }}
                    />
                    <View
                      style={{
                        height: sh(10),
                        backgroundColor: "#EDEDED",
                        borderRadius: sr(99),
                        width: "49%",
                      }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Stats Card ── */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: sr(12),
                paddingHorizontal: sw(2),
                // paddingVertical: sh(28),
                height: sh(94),
                shadowColor: "#000000",
                shadowOpacity: 0.09,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: 0 },
                elevation: 5,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {[
                { value: "50", label: "Matches" },
                { value: "200", label: "Photos Sent" },
                { value: "17", label: "Day Streak" },
              ].map((stat, i) => (
                <React.Fragment key={i}>
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Poppins-SemiBold",
                        fontSize: sf(20),
                        color: "#FBB202",
                        textAlign: "center",
                      }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins-Regular",
                        fontSize: sf(13),
                        color: "#555555",
                        textAlign: "center",
                      }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                  {/* {i < 2 && (
                    <View
                      style={{
                        width: 1,
                        height: sh(36),
                        backgroundColor: '#EDEDED',
                      }}
                    />
                  )} */}
                </React.Fragment>
              ))}
            </View>

            {/* ── Bio Card ── */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: sr(12),
                paddingHorizontal: sw(16),
                height: 139,
                flexDirection: "column",
                justifyContent: "center",
                // gap: sh(12),
                shadowColor: "#000000",
                shadowOpacity: 0.09,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: 0 },
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: sf(18),
                  color: "#000000",
                }}
              >
                Bio
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-Regular",
                  fontSize: sf(16),
                  color: "#7D858E",
                }}
              >
                Adventure lover & coffee enthusiast. Always looking for the next
                trip. Let's explore together! ✈️
              </Text>
            </View>

            {/* ── Interests Card ── */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: sr(12),
                paddingHorizontal: sw(16),
                // paddingVertical: sh(20),
                minHeight: 152,
                justifyContent: "center",
                shadowColor: "#000000",
                shadowOpacity: 0.09,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: 0 },
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: sf(18),
                  color: "#000000",
                  marginBottom: sh(12),
                }}
              >
                Interests
              </Text>
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", gap: sw(10) }}
              >
                {["✈️ Travel", "🎵 Music", "☕ Coffee", "📷 Photography"].map(
                  (interest, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#FBB202",
                        borderRadius: sr(20),
                        paddingHorizontal: sw(14),
                        height: 36,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Regular",
                          fontSize: sf(16),
                          color: "#000000",
                          lineHeight: sh(16),
                        }}
                      >
                        {interest}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* ── Details Card ── */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: sr(12),
                paddingHorizontal: sw(16),
                // paddingVertical: sh(20),
                minHeight: 163,
                justifyContent: "center",
                shadowColor: "#000000",
                shadowOpacity: 0.09,
                shadowRadius: 25,
                shadowOffset: { width: 0, height: 0 },
                elevation: 5,
                marginBottom: sh(8),
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: sf(18),
                  color: "#000000",
                  marginBottom: sh(1),
                }}
              >
                Details
              </Text>

              {[
                { label: "Height", value: "5' 10\"" },
                { label: "Body Type", value: "Slim" },
                { label: "Ethnicity", value: "White" },
              ].map((detail, i) => (
                <React.Fragment key={i}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",

                      paddingVertical: sh(1),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Regular",
                        fontSize: sf(13),
                        color: "#555555",
                      }}
                    >
                      {detail.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Poppins-Medium",
                        fontSize: sf(16),
                        color: "#000000",
                        textAlign: "right",
                      }}
                    >
                      {detail.value}
                    </Text>
                  </View>
                  {/* {i < 2 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: '#EDEDED',
                      }}
                    />
                  )} */}
                </React.Fragment>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom Tab Bar ── */}
        <BottomTabBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1, paddingBottom: sh(20) },
});

export default ProfileScreen;
