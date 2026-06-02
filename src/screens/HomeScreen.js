import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C, WORKOUT_DEFS, FRIDAY_WORKOUTS, SCHEDULE, DN, getWeekDates, getWeekStart, PROG } from '../constants';
import { useAppContext } from '../context';
import HomeHero from '../components/HomeHero';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { sessions, weekIdx } = useAppContext();
  const prog = PROG[weekIdx];
  const today = new Date().getDay();
  const todayKey = today === 1 ? 'upper' : today === 3 ? 'lower' : today === 5 ? 'friday' : null;
  const weekDates = getWeekDates();
  const wfd = { 0: 'upper', 2: 'lower', 4: 'friday' };
  const tw = sessions.filter(s => new Date(s.date) >= getWeekStart(0));

  const startWorkout = (type) => navigation.navigate('Workout', { type });

  return (
    <SafeAreaView style={s.scroll} edges={[]}>
    <ScrollView contentContainerStyle={s.content}>
      <HomeHero sessions={sessions} />

      {/* Mini week strip */}
      <View style={s.weekStrip}>
        {weekDates.map((d, i) => {
          const isT = d.toDateString() === new Date().toDateString();
          const done = sessions.some(s => new Date(s.date).toDateString() === d.toDateString());
          const schedT = wfd[i]; const isFri = schedT === 'friday';
          const dotColor = done ? C.green : isFri ? C.purple : schedT ? C.dim : 'transparent';
          return (
            <TouchableOpacity key={i} onPress={() => navigation.navigate('Plan')}
              style={[s.dayCell, isT ? s.dayCellToday : s.dayCellNormal]}>
              <Text style={[s.dayName, { color: isT ? C.accent : C.muted }]}>{DN[i]}</Text>
              <Text style={[s.dayNum, { color: isT ? C.accent : C.text }]}>{d.getDate()}</Text>
              <View style={[s.dot, { backgroundColor: dotColor }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Today's workout CTA */}
      {todayKey === 'friday' ? (
        <View style={s.section}>
          <Text style={s.sectionLabel}>TODAY — FRIDAY KETTLEBELL</Text>
          <View style={s.fridayRow}>
            {FRIDAY_WORKOUTS.map(t => {
              const wk = WORKOUT_DEFS[t];
              return (
                <TouchableOpacity key={t} onPress={() => startWorkout(t)}
                  style={[s.fridayCard, { backgroundColor: wk.color + '12', borderColor: wk.color + '35' }]}>
                  <Text style={[s.fridayCardLabel, { color: wk.color }]}>{wk.label}</Text>
                  <Text style={s.fridayCardTitle}>{t === 'amrap' ? 'AMRAP\n30 MIN' : '3 ROUNDS\nFOR TIME'}</Text>
                  <View style={[s.fridayCardBtn, { backgroundColor: wk.color }]}>
                    <Text style={[s.fridayCardBtnText, { color: t === 'amrap' ? '#fff' : '#0a0c0f' }]}>START →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : todayKey ? (
        <TouchableOpacity onPress={() => startWorkout(todayKey)} style={s.section}>
          <View style={[s.todayCard, { backgroundColor: WORKOUT_DEFS[todayKey].color + '18', borderColor: WORKOUT_DEFS[todayKey].color + '40' }]}>
            <View style={s.todayCardHeader}>
              <View style={[s.todayBadge, { backgroundColor: WORKOUT_DEFS[todayKey].color + '28' }]}>
                <Text style={[s.todayBadgeText, { color: WORKOUT_DEFS[todayKey].color }]}>{WORKOUT_DEFS[todayKey].label}</Text>
              </View>
              <Text style={s.todayWeek}>Wk {prog.week} {prog.label}</Text>
            </View>
            <Text style={s.todayName}>{WORKOUT_DEFS[todayKey].name}</Text>
            <Text style={s.todayDetail}>{WORKOUT_DEFS[todayKey].duration} · {WORKOUT_DEFS[todayKey].method}</Text>
            <View style={[s.startBtn, { backgroundColor: WORKOUT_DEFS[todayKey].color }]}>
              <Text style={s.startBtnText}>START WORKOUT →</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={s.section}>
          <View style={s.restCard}>
            <Text style={s.restIcon}>🔋</Text>
            <Text style={s.restTitle}>REST DAY</Text>
            <Text style={s.restSub}>Recovery is where strength is built</Text>
            <View style={s.quickRow}>
              {[['upper', 'UPPER', C.accent], ['lower', 'LOWER', C.blue], ['circuit', 'FLOW', C.green], ['amrap', 'AMRAP', C.purple]].map(([t, l, col]) => (
                <TouchableOpacity key={t} onPress={() => startWorkout(t)}
                  style={[s.quickBtn, { backgroundColor: col + '12', borderColor: col + '28' }]}>
                  <Text style={[s.quickBtnText, { color: col }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Stats tiles */}
      <View style={s.statsTiles}>
        <View style={s.statsTile}>
          <Text style={[s.statsTileNum, { color: C.blue }]}>{tw.length}</Text>
          <Text style={s.statsTileTitle}>This Week</Text>
          <Text style={s.statsTileSub}>of 3 planned</Text>
        </View>
        <View style={s.statsTile}>
          <Text style={[s.statsTileNum, { color: C.accent }]}>{sessions.length}</Text>
          <Text style={s.statsTileTitle}>All Time</Text>
          <Text style={s.statsTileSub}>sessions</Text>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 20 },
  weekStrip: { flexDirection: 'row', gap: 4, paddingHorizontal: 14, paddingVertical: 10 },
  dayCell: { flex: 1, borderRadius: 7, paddingVertical: 7, alignItems: 'center' },
  dayCellToday: { backgroundColor: 'rgba(200,169,110,0.13)', borderWidth: 1, borderColor: 'rgba(200,169,110,0.42)' },
  dayCellNormal: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  dayName: { fontSize: 7, letterSpacing: 0.5, marginBottom: 2 },
  dayNum: { fontSize: 12, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 3 },
  section: { marginHorizontal: 14, marginBottom: 12 },
  sectionLabel: { fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 },
  fridayRow: { flexDirection: 'row', gap: 8 },
  fridayCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  fridayCardLabel: { fontSize: 9, letterSpacing: 1, fontFamily: 'Oswald_700Bold', marginBottom: 4 },
  fridayCardTitle: { fontFamily: 'Oswald_700Bold', fontSize: 13, color: C.text, lineHeight: 17, marginBottom: 8, textAlign: 'center' },
  fridayCardBtn: { borderRadius: 6, paddingVertical: 7, paddingHorizontal: 0, width: '100%', alignItems: 'center' },
  fridayCardBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 11, letterSpacing: 1 },
  todayCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  todayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  todayBadge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  todayBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  todayWeek: { fontSize: 10, color: C.muted },
  todayName: { fontFamily: 'Oswald_600SemiBold', fontSize: 19, color: C.text, marginBottom: 3 },
  todayDetail: { color: C.muted, fontSize: 11, marginBottom: 12 },
  startBtn: { borderRadius: 8, padding: 11, alignItems: 'center' },
  startBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: '#0a0c0f', letterSpacing: 1 },
  restCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: 'center' },
  restIcon: { fontSize: 26, marginBottom: 6 },
  restTitle: { fontFamily: 'Oswald_400Regular', fontSize: 16, color: C.text, letterSpacing: 0.5 },
  restSub: { color: C.muted, fontSize: 11, marginTop: 4, marginBottom: 11 },
  quickRow: { flexDirection: 'row', gap: 7 },
  quickBtn: { flex: 1, borderWidth: 1, borderRadius: 7, padding: 8, alignItems: 'center' },
  quickBtnText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  statsTiles: { flexDirection: 'row', gap: 10, marginHorizontal: 14, marginBottom: 14 },
  statsTile: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 13 },
  statsTileNum: { fontFamily: 'Oswald_700Bold', fontSize: 26 },
  statsTileTitle: { fontSize: 11, color: C.text, marginTop: 3 },
  statsTileSub: { fontSize: 10, color: C.muted },
});
