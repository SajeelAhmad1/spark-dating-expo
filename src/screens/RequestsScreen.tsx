import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/common/Text';
import { ChevronLeft, Heart, X, RefreshCw } from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';
import { sf, sh, sw, sr } from '@/utils/sizeMatters';
import {
  useAcceptConnectionRequest,
  useConnectionRequests,
  useRejectConnectionRequest,
} from '@/features/social/hooks';
import type { ConnectionRequest } from '@/features/social/schema';

// ── Request card ──────────────────────────────────────────────────────────────

function RequestCard({
  request,
  onAccept,
  onReject,
  onViewProfile,
  isAccepting,
  isRejecting,
}: {
  request: ConnectionRequest;
  onAccept: () => void;
  onReject: () => void;
  onViewProfile: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}) {
  const name =
    `${request.peer.firstName ?? ''} ${request.peer.lastName ?? ''}`.trim() ||
    'Unknown';
  const avatar = request.peer.photos[0];

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onViewProfile}
    >
      <View style={styles.card}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: '#EDEDED',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text style={{ fontSize: sf(22) }}>👤</Text>
          </View>
        )}

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
            }}
          >
            Wants to connect with you
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onReject}
            disabled={isRejecting || isAccepting}
            style={[
              styles.iconBtn,
              styles.iconBtnNeutral,
              (isRejecting || isAccepting) && { opacity: 0.5 },
            ]}
          >
            {isRejecting ? (
              <ActivityIndicator
                size='small'
                color='#4A4A4A'
              />
            ) : (
              <X
                size={sf(14)}
                color='#4A4A4A'
                strokeWidth={2.5}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onAccept}
            disabled={isAccepting || isRejecting}
            style={[
              styles.iconBtn,
              styles.iconBtnLike,
              (isAccepting || isRejecting) && { opacity: 0.5 },
            ]}
          >
            {isAccepting ? (
              <ActivityIndicator
                size='small'
                color='#FFFFFF'
              />
            ) : (
              <Heart
                size={sf(19)}
                color='#FFFFFF'
                fill='#FFFFFF'
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RequestsScreen({ navigation }: any) {
  const [page] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } =
    useConnectionRequests('received', page);

  const { mutate: accept } = useAcceptConnectionRequest();
  const { mutate: reject } = useRejectConnectionRequest();

  const requests = data?.requests ?? [];
  const total = data?.total ?? 0;

  const handleAccept = (req: ConnectionRequest) => {
    setProcessingId(req.id);
    accept(req.id, {
      onSuccess: (res) => {
        setProcessingId(null);
        if (res.matchId) {
          navigation.navigate('MatchScreen', {
            match: {
              id: req.peer.id,
              name: `${req.peer.firstName ?? ''} ${req.peer.lastName ?? ''}`.trim(),
              image: req.peer.photos[0] ?? '',
            },
          });
        }
      },
      onError: () => setProcessingId(null),
    });
  };

  const handleReject = (req: ConnectionRequest) => {
    setProcessingId(req.id);
    reject(req.id, {
      onSettled: () => setProcessingId(null),
    });
  };

  return (
    <View style={styles.safeArea}>
      {/* ── Back ──────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          paddingHorizontal: sw(16),
          paddingTop: sh(12),
          paddingBottom: sh(4),
        }}
      >
        <ChevronLeft
          size={22}
          color='#000'
        />
      </TouchableOpacity>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.headerRow,
          { paddingHorizontal: sw(16), marginBottom: sh(20), marginTop: sh(4) },
        ]}
      >
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: sf(28),
            color: '#000000',
          }}
        >
          New Matches
        </Text>

        <View style={[styles.badge, { backgroundColor: '#FBB202' }]}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: sf(13),
              color: '#000000',
              textAlign: 'center',
            }}
          >
            {String(total).padStart(2, '0')}
          </Text>
        </View>

        {isFetching && (
          <ActivityIndicator
            size='small'
            color='#1E78F5'
          />
        )}
      </View>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {isLoading && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color='#1E78F5' />
        </View>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: sh(12),
          }}
        >
          <Text style={{ color: '#7D858E', fontSize: sf(14) }}>
            Could not load requests.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: sw(6),
              backgroundColor: '#1E78F5',
              paddingHorizontal: sw(16),
              paddingVertical: sh(10),
              borderRadius: sr(99),
            }}
          >
            <RefreshCw
              size={sf(16)}
              color='#FFFFFF'
            />
            <Text
              style={{
                color: '#FFFFFF',
                fontFamily: 'Poppins-SemiBold',
                fontSize: sf(14),
              }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.flex1}
          contentContainerStyle={{ paddingBottom: sh(140) }}
        >
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={() => handleAccept(req)}
              onReject={() => handleReject(req)}
              onViewProfile={() =>
                navigation.navigate('UserProfileScreen', {
                  requestId: req.id,
                  peer: req.peer,
                })
              }
              isAccepting={processingId === req.id && true}
              isRejecting={processingId === req.id && false}
            />
          ))}

          {requests.length === 0 && (
            <View
              style={{ alignItems: 'center', marginTop: sh(60), gap: sh(12) }}
            >
              <Text style={{ fontSize: sf(40) }}>🕊️</Text>
              <Text
                style={{
                  fontSize: sf(15),
                  color: '#8D8D8D',
                  textAlign: 'center',
                }}
              >
                No new connection requests
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: sh(72),
    backgroundColor: '#FFFFFF',
    paddingBottom: sh(20),
  },
  flex1: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', columnGap: sw(8) },
  badge: {
    borderRadius: 9999,
    height: sh(28),
    width: sw(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
