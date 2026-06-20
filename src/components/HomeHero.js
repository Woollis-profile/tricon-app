import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, getWeekStart } from '../constants';

export default function HomeHero({ sessions }) {
  const tw = sessions.filter(s => new Date(s.date) >= getWeekStart(0));

  return (
    <View style={s.hero}>
      <View style={s.title1Row}>
        <Text style={s.triangle}>△ </Text>
        <Text style={s.title1}>TRICON</Text>
      </View>
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
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'visible',
  },
  title1Row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  triangle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 48,
    color: '#ffffff',
    lineHeight: 62,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0.8, height: 0 },
    textShadowRadius: 1.5,
  },
  title1: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 48,
    color: C.accent,
    letterSpacing: 4,
    lineHeight: 62,
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
    overflow: 'visible',
  },
  statInner: {
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'visible',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  statNum: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 26,
    lineHeight: 34,
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