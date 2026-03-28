import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { Heart, X } from 'lucide-react-native';
import { sf } from '@/utils/responsive';

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
            lineHeight: sf(16),
            color: '#000000',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: sf(13),
            lineHeight: sf(13),
            color: '#555555',
            marginTop: 4,
          }}
        >
          Wants to connect with you
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnNeutral]}
        >
          <X size={14} color="#4A4A4A" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconBtn, styles.iconBtnLike]}>
          <Heart size={19} color="#FFFFFF" fill="#FFFFFF" />
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.002,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    marginRight: 12,
  },
  body: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  iconBtn: {
    width: 32,
    height: 32,
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
