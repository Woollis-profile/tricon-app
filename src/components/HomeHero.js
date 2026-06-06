import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, getWeekStart } from '../constants';

export default function HomeHero({ sessions }) {
  const tw = sessions.filter(s => new Date(s.date) >= getWeekStart(0));

  return (
    <View style={s.hero}>
      <Text style={s.tagline}>TRAINING METHOD FOR THE OLDER AND WISER ATHLETE</Text>
      <Text style={s.title1}>TRICON</Text>
      <Text style={s.title2}>WORKOUT</Text>
      <View style={s.statsRow}>
        {[[sessions.length, 'SESSIONS', C.accent], [tw.length, 'THIS WEEK', C.text], [9, 'REPS/SET', C.text]].map(([v, l, col], i) => (
          <View key={l} style={s.statItem}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.statInner}>
              <Text style={[s.statNum, { color: col }]}>{v}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: '#0a0c0f',
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 11,
    color: C.muted,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Oswald_400Regular',
  },
  title1: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 48,
    color: '#e8e2d6',
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 6,
  },
  title2: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 48,
    color: '#c8a96e',
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 52,
    marginTop: 6,
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statInner: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  statNum: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 26,
    lineHeight: 26,
    textAlign: 'center',
  },
  statLbl: {
    fontSize: 9,
    color: C.muted,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 2,
  },
});
