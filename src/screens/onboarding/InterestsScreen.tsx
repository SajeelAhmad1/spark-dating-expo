// screens/onboarding/InterestsScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft } from 'lucide-react-native';
import PrimaryButton from '@/components/common/PrimaryButton';
import { FieldError } from '@/components/common/FieldError';
import { sf, sw, sh } from '@/utils/sizeMatters';
import { interestsSelectionSchema } from '@/schemas/onboarding';
import {
  useSignupStore,
  selectInterests,
  selectPatch,
} from '@/store/signupStore';
import { useInterestsCatalog } from '@/features/interests/hooks';
import type { Interest } from '@/features/interests/schema';

const MAX = 5;
const MIN = 3;

// ─── Helper ───────────────────────────────────────────────────────────────────
// Groups a flat Interest[] by category, preserving backend order.

function groupByCategory(
  interests: Interest[],
): { category: string; items: string[] }[] {
  const map = new Map<string, string[]>();

  for (const interest of interests) {
    const cat = interest.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(interest.name);
  }

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const InterestsScreen = ({ navigation }: any) => {
  const storedInterests = useSignupStore(selectInterests);
  const patch = useSignupStore(selectPatch);

  const { data: rawData, isPending, isError, refetch } = useInterestsCatalog();
  console.log(rawData, "interest data")

  // Safely extract the array regardless of how the interceptor unwraps the envelope.
  // Backend shape: { status: 'success', data: { interests: [...] } }
  // After interceptor unwraps .data once:  { interests: [...] }
  // This handles both cases so it won't break if the interceptor is updated.
  const catalogItems: Interest[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData; // already unwrapped to array
    const asObj = rawData as any;
    if (Array.isArray(asObj.interests)) return asObj.interests; // { interests: [...] }
    if (asObj.data && Array.isArray(asObj.data.interests))
      return asObj.data.interests; // { data: { interests: [...] } }
    if (asObj.data && Array.isArray(asObj.data)) return asObj.data; // { data: [...] }
    return [];
  }, [rawData]);

  const categories = useMemo(
    () => groupByCategory(catalogItems),
    [catalogItems],
  );

  const [selected, setSelected] = useState<string[]>(
    storedInterests.length > 0 ? storedInterests : [],
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
          <ChevronLeft
            size={sf(24)}
            color='#000000'
          />
        </TouchableOpacity>

        <View style={{ marginTop: sh(12), gap: sh(6) }}>
          <Text
            style={{ fontSize: sf(28), fontWeight: '600', color: '#000000' }}
          >
            Your Interests
          </Text>
          <Text
            style={{ fontSize: sf(15), fontWeight: '400', color: '#7D858E' }}
          >
            Choose at least {MIN} interests (max {MAX})
          </Text>
        </View>

        {/* ── Loading ────────────────────────────────────────────────────────── */}
        {isPending && (
          <View style={{ marginTop: sh(40), alignItems: 'center' }}>
            <ActivityIndicator color='#FBB202' />
            <Text
              style={{ marginTop: sh(8), color: '#7D858E', fontSize: sf(14) }}
            >
              Loading interests…
            </Text>
          </View>
        )}

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {isError && !isPending && (
          <View
            style={{ marginTop: sh(40), alignItems: 'center', gap: sh(12) }}
          >
            <Text
              style={{
                color: '#7D858E',
                fontSize: sf(14),
                textAlign: 'center',
              }}
            >
              Could not load interests. Please try again.
            </Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text
                style={{
                  color: '#1E78F5',
                  fontSize: sf(14),
                  fontWeight: '500',
                }}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Interest chips ─────────────────────────────────────────────────── */}
        {!isPending && !isError && (
          <View style={{ marginTop: sh(24), gap: sh(24) }}>
            {categories.map(({ category, items }) => (
              <View key={category}>
                <Text
                  style={{
                    fontSize: sf(15),
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: sh(12),
                  }}
                >
                  {category}
                </Text>
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
                >
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
                          backgroundColor: isSelected
                            ? '#FBB202'
                            : 'transparent',
                          height: 40,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: sf(13),
                            fontWeight: '400',
                            color: isSelected ? '#000000' : '#7D858E',
                            lineHeight: 40,
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={{ fontSize: sf(15), fontWeight: '500', color: '#FBB202' }}>
          {selected.length}/{MAX} selected
        </Text>
        <FieldError message={interestsError} />
        <PrimaryButton
          title='Continue'
          onPress={onContinue}
          colors={['#1E78F5', '#FBB202']}
          variant='gradient'
          style={{
            alignSelf: 'stretch',
            opacity: selected.length >= MIN ? 1 : 0.5,
          }}
          textStyle={{
            fontSize: sf(20),
            fontWeight: '500',
            lineHeight: sh(56),
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: sh(40) },
  scroll: {
    flex: 1,
    paddingHorizontal: sw(20),
    paddingTop: sh(16),
    marginTop: sh(60),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: sw(24),
    paddingBottom: sh(20),
    paddingTop: sh(8),
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: sh(12),
  },
});

export default InterestsScreen;
