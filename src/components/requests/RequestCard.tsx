import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { Heart, X } from 'lucide-react-native';
import { sf, sw, sh, sr } from '@/utils/responsive';

export default function RequestCard({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: avatar }} style={styles.avatar} />

      <View style={styles.body}>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(16), 
            color: '#000000',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(13), 
            color: '#555555',
            // marginTop: sh(4),
          }}
        >
          Wants to connect with you
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnNeutral]}
        >
          <X size={sf(14)} color="#4A4A4A" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconBtn, styles.iconBtnLike]}>
          <Heart size={sf(19)} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: sh(72),
    borderRadius: sr(16),
    paddingHorizontal: sw(16),
    paddingVertical: sh(12),
    marginBottom: sh(12),
    marginHorizontal: sw(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.002,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: sw(48),
    height: sh(48),
    borderRadius: 9999,
    marginRight: sw(12),
  },
  body: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', columnGap: sw(8) },
  iconBtn: {
    width: sw(32),
    height: sh(32),
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnNeutral: {
    backgroundColor: '#EDEDED',
    borderWidth: 0.5,
    borderColor: 'rgba(30,30,30,0.2)',
  },
  iconBtnLike: { backgroundColor: '#FF073E' },
});
