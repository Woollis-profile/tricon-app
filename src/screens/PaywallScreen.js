import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground, StyleSheet,
  ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { purchaseUnlock, restorePurchases } from '../lib/purchases';

const GOLD = '#c8a96e';

const FEATURES = [
  'All workouts — Upper, Lower, AMRAP, Kettlebell Flow',
  'TriCon timers with audio cues',
  'Full session history and stats',
  'Cloud sync across devices',
];

export default function PaywallScreen({ onUnlocked }) {
  const [loading,  setLoading]  = useState(null); // null | 'purchase' | 'restore'
  const [error,    setError]    = useState('');

  const handlePurchase = async () => {
    setError('');
    setLoading('purchase');
    try {
      const unlocked = await purchaseUnlock();
      if (unlocked) onUnlocked();
      else setError('Purchase could not be verified. Please try again.');
    } catch (e) {
      setError(e.message || 'Purchase failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async () => {
    setError('');
    setLoading('restore');
    try {
      const unlocked = await restorePurchases();
      if (unlocked) onUnlocked();
      else setError('No previous purchase found.');
    } catch (e) {
      setError('No previous purchase found.');
    } finally {
      setLoading(null);
    }
  };

  const busy = loading !== null;

  return (
    <ImageBackground
      source={require('../../assets/gym-bg.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={s.overlay} />

      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/tricon-logo.png')}
          style={s.logo}
          resizeMode="contain"
        />

        <Text style={s.headline}>UNLOCK TRICON</Text>

        <Text style={s.subline}>
          {'One-time purchase. No subscription.\nOwn it forever.'}
        </Text>

        <View style={s.features}>
          {FEATURES.map((feat) => (
            <View key={feat} style={s.featureRow}>
              <Text style={s.check}>✓</Text>
              <Text style={s.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[s.btn, busy && s.btnDisabled]}
          onPress={handlePurchase}
          disabled={busy}
          activeOpacity={0.82}
        >
          {loading === 'purchase' ? (
            <ActivityIndicator color={GOLD} />
          ) : (
            <Text style={s.btnText}>UNLOCK TRICON — $14.99</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={busy}
          activeOpacity={0.7}
        >
          <Text style={s.restore}>
            {loading === 'restore' ? 'Restoring…' : 'RESTORE PURCHASE'}
          </Text>
        </TouchableOpacity>

        <Text style={s.restoreHint}>
          Already purchased on another device? Tap Restore.
        </Text>
      </ScrollView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logo: {
    width: 110,
    height: 110,
  },
  headline: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 36,
    fontWeight: '700',
    color: '#e8e2d6',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 16,
  },
  subline: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  features: {
    marginTop: 24,
    marginBottom: 4,
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  check: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  featureText: {
    color: '#e8e2d6',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  error: {
    color: '#e05252',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: GOLD,
    width: 340,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#0a0c0f',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  restore: {
    fontSize: 11,
    color: GOLD,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 1.5,
  },
  restoreHint: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
  },
});
