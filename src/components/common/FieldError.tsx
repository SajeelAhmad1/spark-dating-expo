import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { sf } from '@/utils/sizeMatters';

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    marginTop: 6,
    fontSize: sf(12), 
    color: '#DC2626',
    fontFamily: 'Poppins-Regular',
  },
});
