import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, WORKOUT_DEFS, SCHEDULE, FRIDAY_WORKOUTS, DN, PROG, getWeekDates } from '../constants';
import { useAppContext } from '../context';

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { sessions, weekIdx } = useAppContext();
  const weekDates = getWeekDates();
  // Default to today's index in the MON-SUN week array (JS 0=Sun → array 6=Sun)
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const prog = PROG[weekIdx];

  const startWorkout = (type) => {
    if (type === 'friday') { navigation.navigate('FridayPicker'); }
    else { navigation.navigate('Workout', { type }); }
  };

  const renderDayCard = (dayIdx) => {
    const schedType = SCHEDULE[dayIdx];
    const date = weekDates[dayIdx];
    const isToday = date.toDateString() === new Date().toDateString();

    if (!schedType) {
      return (
        <View style={s.restCard}>
          <Text style={s.restIcon}>🔋</Text>
          <Text style={s.restTitle}>REST DAY</Text>
          <Text style={s.restSub}>{'Active recovery · Light walking encouraged\nAdaptation happens at rest'}</Text>
        </View>
      );
    }

    if (schedType === 'friday') {
      return (
        <View>
          <Text style={s.fridayHint}>FRIDAY — CHOOSE YOUR WORKOUT</Text>
          {FRIDAY_WORKOUTS.map(fType => {
            const wk = WORKOUT_DEFS[fType];
            const fdone = sessions.some(s => new Date(s.date).toDateString() === date.toDateString() && s.type === fType);
            return (
              <TouchableOpacity key={fType} activeOpacity={0.85} onPress={() => startWorkout(fType)} style={s.fridayCardWrap}>
                <LinearGradient colors={[wk.color + '18', wk.color + '06']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[s.fridayCard, { borderColor: wk.color + '40' }]}>
                  <View style={s.fridayCardTop}>
                    <View>
                      <Text style={[s.fridayCardSub, { color: wk.color }]}>{wk.label}</Text>
                      <Text style={s.fridayCardTitle}>{wk.name.toUpperCase()}</Text>
                      <Text style={s.fridayCardMeta}>{wk.duration} · {wk.method}</Text>
                    </View>
                    {fdone && <View style={s.doneBadge}><Text style={s.doneBadgeText}>DONE ✓</Text></View>}
                  </View>
                  <Text style={s.fridayCardBullets}>
                    {fType === 'amrap' ? '10× Swings · 5× Press L+R · 5× Squat R+L · ½max Push-Ups' : 'Helicopters CCW+CW · Halos CCW+CW · Pullovers'}
                  </Text>
                  <View style={[s.startBtn, { backgroundColor: wk.color }]}>
                    <Text style={[s.startBtnText, { color: fType === 'amrap' ? '#fff' : '#0a0c0f' }]}>{fdone ? 'START AGAIN →' : 'START →'}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    const wk = WORKOUT_DEFS[schedType];
    const done = sessions.some(s => new Date(s.date).toDateString() === date.toDateString());
    return (
      <View>
        <TouchableOpacity activeOpacity={0.85} onPress={() => startWorkout(schedType)}>
          <LinearGradient colors={[wk.color + '18', wk.color + '06']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[s.dayCard, { borderColor: wk.color + '40' }]}>
            <View style={s.dayCardTop}>
              <View>
                <Text style={[s.dayCardLabel, { color: wk.color }]}>{wk.label}</Text>
                <Text style={s.dayCardTitle}>{wk.name.toUpperCase()}</Text>
                <Text style={s.dayCardMeta}>{DN[dayIdx]} · {wk.duration}</Text>
              </View>
              {done
                ? <View style={[s.statusBadge, { backgroundColor: C.green + '18', borderColor: C.green + '30' }]}><Text style={[s.statusBadgeText, { color: C.green }]}>DONE ✓</Text></View>
                : <View style={[s.statusBadge, { backgroundColor: wk.color + '18', borderColor: wk.color + '30' }]}><Text style={[s.statusBadgeText, { color: wk.color }]}>{isToday ? 'TODAY' : 'UPCOMING'}</Text></View>
              }
            </View>
            <View style={[s.dayStartBtn, { backgroundColor: wk.color }]}>
              <Text style={s.dayStartBtnText}>{done ? 'START AGAIN →' : 'START WORKOUT →'}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <View style={s.exList}>
          {wk.exercises.map((ex, i) => (
            <View key={ex.id} style={[s.exRow, i < wk.exercises.length - 1 && s.exRowBorder]}>
              <View style={[s.exBadge, { backgroundColor: wk.color + '18' }]}>
                <Text style={[s.exBadgeText, { color: wk.color }]}>{i + 1}</Text>
              </View>
              <View style={s.exInfo}>
                <Text style={s.exName}>{ex.name}</Text>
                <Text style={s.exMuscle}>{ex.muscle}</Text>
              </View>
              <Text style={[s.exSets, { color: wk.color }]}>{prog.sets}×9</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.headerArea}>
        <Text style={s.pageTitle}>PLAN</Text>
        <Text style={s.pageHint}>Tap a day to preview and start your workout</Text>
      </View>

      {/* 7-day strip */}
      <View style={s.strip}>
        {weekDates.map((d, i) => {
          const isT = d.toDateString() === new Date().toDateString();
          const schedType = SCHEDULE[i];
          const isFri = schedType === 'friday';
          const done = sessions.some(s => new Date(s.date).toDateString() === d.toDateString());
          const isSel = selectedDay === i;
          const dotColor = isFri ? C.purple : schedType ? WORKOUT_DEFS[schedType]?.color : null;
          return (
            <TouchableOpacity key={i} onPress={() => setSelectedDay(prev => prev === i ? null : i)}
              style={[s.stripCell, isSel && dotColor && { backgroundColor: dotColor + '18' }, isT && !isSel && { backgroundColor: 'rgba(200,169,110,0.06)' }]}>
              <Text style={[s.stripDay, (isT || isSel) && { color: dotColor || C.accent }]}>{DN[i]}</Text>
              <Text style={[s.stripDate, (isT || isSel) && { color: dotColor || C.accent }]}>{d.getDate()}</Text>
              {schedType ? (
                <View style={[s.stripDot, { backgroundColor: done ? C.green : isFri ? C.purple : dotColor }]} />
              ) : null}
              {isSel && <View style={[s.stripUnderline, { backgroundColor: dotColor || C.accent }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {selectedDay !== null && (
          <View style={s.dayCardWrap}>{renderDayCard(selectedDay)}</View>
        )}

        {/* Weekly schedule — always visible */}
        <View style={s.scheduleCard}>
          <Text style={s.scheduleTitle}>THIS WEEK</Text>
          {[
            { type: 'upper', dayIdx: 0, label: 'Monday' },
            { type: 'lower', dayIdx: 2, label: 'Wednesday' },
            { type: 'friday', dayIdx: 4, label: 'Friday' },
          ].map(({ type, dayIdx, label }) => {
            const isFri = type === 'friday';
            const wk = isFri ? null : WORKOUT_DEFS[type];
            const col = isFri ? C.purple : wk.color;
            const done = sessions.some(s => new Date(s.date).toDateString() === weekDates[dayIdx].toDateString());
            const isSelected = selectedDay === dayIdx;
            return (
              <TouchableOpacity key={type} onPress={() => setSelectedDay(prev => prev === dayIdx ? null : dayIdx)}
                style={[s.scheduleRow, isSelected && { backgroundColor: col + '10' }]}>
                <View style={[s.scheduleIcon, { backgroundColor: col + '18' }]}>
                  <Text style={[s.scheduleIconText, { color: col }]}>{label.slice(0, 3).toUpperCase()}</Text>
                </View>
                <View style={s.scheduleInfo}>
                  <Text style={s.scheduleName}>{isFri ? 'Friday Kettlebell' : wk.name}</Text>
                  <Text style={s.scheduleMeta}>
                    {isFri ? 'KB Benchmark AMRAP · Kettlebell Flow' : `${wk.duration} · ${wk.method}`}
                  </Text>
                </View>
                {done
                  ? <Text style={s.scheduleDone}>DONE ✓</Text>
                  : <Text style={[s.scheduleChevron, isSelected && { color: col }]}>›</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  headerArea: { paddingTop: 16, paddingHorizontal: 14, paddingBottom: 10 },
  pageTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: C.text, letterSpacing: 1, marginBottom: 4 },
  pageHint: { fontSize: 11, color: C.muted },
  strip: { flexDirection: 'row', marginHorizontal: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden' },
  stripCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 3, alignItems: 'center', minHeight: 80 },
  stripDay: { fontSize: 8, color: C.muted, letterSpacing: 0.7, marginBottom: 3 },
  stripDate: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 5 },
  stripDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  stripUnderline: { width: 14, height: 2, borderRadius: 1, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 12, paddingHorizontal: 14, paddingBottom: 80, flexGrow: 1 },
  dayCardWrap: { marginTop: 4 },
  restCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingTop: 14, paddingHorizontal: 18, paddingBottom: 18, alignItems: 'center', marginTop: 4, overflow: 'visible' },
  restIcon: { fontSize: 28, lineHeight: 36, marginBottom: 8 },
  restTitle: { fontFamily: 'Oswald_400Regular', fontSize: 16, color: C.text, letterSpacing: 1, lineHeight: 20 },
  restSub: { fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 18, textAlign: 'center' },
  fridayHint: { fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 },
  fridayCardWrap: { marginBottom: 10 },
  fridayCard: { borderWidth: 1, borderRadius: 14, padding: 14, overflow: 'visible' },
  fridayCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  fridayCardSub: { fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 3 },
  fridayCardTitle: { fontFamily: 'Oswald_700Bold', fontSize: 18, color: C.text, lineHeight: 23 },
  fridayCardMeta: { fontSize: 10, color: C.muted, marginTop: 4 },
  doneBadge: { backgroundColor: C.green + '18', borderWidth: 1, borderColor: C.green + '30', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 8 },
  doneBadgeText: { fontSize: 10, color: C.green, fontWeight: '700' },
  fridayCardBullets: { fontSize: 10, color: C.sub, lineHeight: 18, marginBottom: 10 },
  startBtn: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  startBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 13, letterSpacing: 1 },
  dayCard: { borderWidth: 1, borderRadius: 14, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16, marginBottom: 12, overflow: 'visible' },
  dayCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  dayCardLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  dayCardTitle: { fontFamily: 'Oswald_700Bold', fontSize: 24, color: C.text, lineHeight: 31 },
  dayCardMeta: { fontSize: 11, color: C.muted, marginTop: 5 },
  statusBadge: { borderWidth: 1, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  dayStartBtn: { borderRadius: 10, padding: 13, alignItems: 'center' },
  dayStartBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 15, color: '#0a0c0f', letterSpacing: 1 },
  exList: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden' },
  exRow: { paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  exRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  exBadge: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  exBadgeText: { fontSize: 10, fontWeight: '700' },
  exInfo: { flex: 1 },
  exName: { fontSize: 13, color: C.text, fontWeight: '600' },
  exMuscle: { fontSize: 10, color: C.muted, marginTop: 2 },
  exSets: { fontSize: 9, fontWeight: '700' },
  quickList: { gap: 10, marginTop: 4 },
  quickItem: { backgroundColor: C.card, borderWidth: 1, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickIconText: { fontSize: 10, fontFamily: 'Oswald_700Bold' },
  quickInfo: { flex: 1 },
  quickName: { fontSize: 13, color: C.text, fontWeight: '600' },
  quickMeta: { fontSize: 10, color: C.muted, marginTop: 2 },
  quickDone: { fontSize: 10, color: C.green, fontWeight: '700' },
  quickChevron: { color: C.muted, fontSize: 13 },
  scheduleCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginTop: 14 },
  scheduleTitle: { fontSize: 9, color: C.muted, letterSpacing: 2, fontWeight: '700', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  scheduleIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  scheduleIconText: { fontSize: 9, fontFamily: 'Oswald_700Bold' },
  scheduleInfo: { flex: 1 },
  scheduleName: { fontSize: 13, color: C.text, fontWeight: '600' },
  scheduleMeta: { fontSize: 10, color: C.muted, marginTop: 2 },
  scheduleDone: { fontSize: 10, color: C.green, fontWeight: '700' },
  scheduleChevron: { color: C.muted, fontSize: 13 },
});
