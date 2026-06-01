import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { C, getWeekStart } from '../constants';

const { width: SW } = Dimensions.get('window');
const VH = 200;

export default function HomeHero({ sessions }) {
  const tw = sessions.filter(s => new Date(s.date) >= getWeekStart(0));

  return (
    <View style={s.hero}>
      <Svg style={StyleSheet.absoluteFill} opacity={0.04} viewBox={`0 0 375 ${VH}`} preserveAspectRatio="none">
        {Array.from({ length: 20 }, (_, i) => (
          <Line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2={VH} stroke={C.accent} strokeWidth="0.5" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <Line key={`h${i}`} x1="0" y1={i * 20} x2="375" y2={i * 20} stroke={C.accent} strokeWidth="0.5" />
        ))}
      </Svg>
      <LinearGradient
        colors={[C.accent, C.orange, 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={s.accentBar}
      />
      <View style={s.content}>
        <Text style={s.subtitle}>GARY WALKER METHOD · OVER 50s</Text>
        <Text style={s.title1}>TRICON</Text>
        <Text style={s.title2}><Text style={{ color: C.accent }}>WORKOUT</Text></Text>
        <View style={s.statsRow}>
          {[[sessions.length, 'SESSIONS', C.accent], [tw.length, 'THIS WEEK', C.text], [9, 'REPS/SET', C.text]].map(([v, l, col], i) => (
            <View key={l} style={s.statItem}>
              {i > 0 && <View style={s.divider} />}
              <View>
                <Text style={[s.statNum, { color: col }]}>{v}</Text>
                <Text style={s.statLbl}>{l}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: C.bg },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  content: { paddingTop: 26, paddingBottom: 20, paddingLeft: 22, paddingRight: 18, position: 'relative', zIndex: 1 },
  subtitle: { fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 6, fontFamily: 'Oswald_400Regular' },
  title1: { fontFamily: 'Oswald_700Bold', fontSize: 42, color: C.text, lineHeight: 38, letterSpacing: 1, marginBottom: 2 },
  title2: { fontFamily: 'Oswald_700Bold', fontSize: 42, lineHeight: 38, letterSpacing: 1, marginBottom: 14 },
  statsRow: { flexDirection: 'row', marginTop: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 28, backgroundColor: C.border, marginHorizontal: 10 },
  statNum: { fontFamily: 'Oswald_700Bold', fontSize: 26, lineHeight: 26 },
  statLbl: { fontSize: 9, color: C.muted, letterSpacing: 1 },
});
