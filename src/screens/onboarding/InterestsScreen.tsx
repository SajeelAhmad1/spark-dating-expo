// screens/onboarding/InterestsScreen.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft } from 'lucide-react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import { FieldError } from '@/components/common/FieldError';
import { sf, sw, sh } from '@/utils/sizeMatters';
import { interestsSelectionSchema } from '@/schemas/onboarding';
import { useSignupStore, selectInterests, selectPatch } from '@/store/signupStore';

const INTERESTS = [
  {
    category: 'Content & Lifestyle',
    items: ['Content Creation', 'Privacy-Focused Lifestyle', 'Online Entrepreneurship', 'Traveling for Work'],
  },
  {
    category: 'Wellness & Growth',
    items: ['Fitness / Body Maintenance', 'Fame-Aware Dating', 'Mental Health & Self-Care'],
  },
  {
    category: 'Creative & Hobbies',
    items: ['Photography', 'Music', 'Gaming', 'Art', 'Books', 'Movies'],
  },
  {
    category: 'Lifestyle',
    items: ['Travel', 'Food', 'Cooking', 'Dancing', 'Sports'],
  },
];

const MAX = 5;
const MIN = 3;

const InterestsScreen = ({ navigation }: any) => {
  const storedInterests = useSignupStore(selectInterests);
  const patch           = useSignupStore(selectPatch);

  // Seed from store; fall back to demo defaults on first visit
  const [selected, setSelected] = useState<string[]>(
    storedInterests.length > 0
      ? storedInterests
      : ['Photography', 'Travel', 'Traveling for Work'],
  );
  const [interestsError, setInterestsError] = useState<string | undefined>();

  const toggle = (item: string) => {
    setInterestsError(undefined);
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((s) => s !== item)
        : prev.length < MAX
        ? [...prev, item]
        : prev,
    );
  };

  const onContinue = () => {
    const parsed = interestsSelectionSchema.safeParse(selected);
    if (!parsed.success) {
      setInterestsError(parsed.error.issues[0]?.message);
      return;
    }
    patch({ interests: selected });
    navigation?.navigate('UploadPhotosScreen');
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: sh(130) }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft size={sf(24)} color="#000000" />
        </TouchableOpacity>

        <View style={{ marginTop: sh(12), gap: sh(6) }}>
          <Text style={{ fontSize: sf(28), fontWeight: '600', color: '#000000' }}>
            Your Interests
          </Text>
          <Text style={{ fontSize: sf(15), fontWeight: '400', color: '#7D858E' }}>
            Choose at least 3 interests (max 5)
          </Text>
        </View>

        <View style={{ marginTop: sh(24), gap: sh(24) }}>
          {INTERESTS.map(({ category, items }) => (
            <View key={category}>
              <Text style={{ fontSize: sf(15), fontWeight: '600', color: '#000000', marginBottom: sh(12) }}>
                {category}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {items.map((item) => {
                  const isSelected = selected.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => toggle(item)}
                      style={{
                        paddingHorizontal: sw(14),
                        borderRadius: 999,
                        borderWidth: isSelected ? 0 : 0.4,
                        borderColor: '#B6B9C9',
                        backgroundColor: isSelected ? '#FBB202' : 'transparent',
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: sf(13), fontWeight: '400', color: isSelected ? '#000000' : '#7D858E', lineHeight: 40 }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingHorizontal: sw(24),
        paddingBottom: sh(20),
        paddingTop: sh(8),
        backgroundColor: '#fff',
        alignItems: 'center',
        gap: sh(12),
      }}>
        <Text style={{ fontSize: sf(15), fontWeight: '500', color: '#FBB202' }}>
          {selected.length}/{MAX} selected
        </Text>
        <FieldError message={interestsError} />
        <PrimaryButton
          title="Continue"
          onPress={onContinue}
          colors={['#1E78F5', '#FBB202']}
          variant="gradient"
          style={{ alignSelf: 'stretch', opacity: selected.length >= MIN ? 1 : 0.5 }}
          textStyle={{ fontSize: sf(20), fontWeight: '500', lineHeight: sh(56) }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(40) },
  scroll:   { flex: 1, paddingHorizontal: sw(20), paddingTop: sh(16), marginTop: sh(60) },
});

export default InterestsScreen;