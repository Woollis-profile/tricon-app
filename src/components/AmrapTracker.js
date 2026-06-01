import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, AMRAP_TOTAL, fmt } from '../constants';
import { beepRound } from '../audio';

const R = 54, cx = 64, cy = 64, circ = 2 * Math.PI * R;

export default function AmrapTracker({ exercises, elapsed, pushupMax, kbWeight, unit, onRoundComplete, roundCount }) {
  const halfPushups = Math.max(1, Math.floor(pushupMax / 2));
  const resolvedExercises = exercises.map(ex => ({ ...ex, resolvedReps: ex.id === 'amrap_pushup' ? halfPushups : ex.reps }));
  const [checkedEx, setCheckedEx] = useState(Array(exercises.length).fill(false));
  const allChecked = checkedEx.every(Boolean);
  const remaining = AMRAP_TOTAL - elapsed;
  const pct = Math.max(0, remaining / AMRAP_TOTAL);
  const isWarning = remaining <= 300;
  const isEnd = remaining <= 0;
  const ringColor = isEnd ? C.red : isWarning ? C.orange : C.purple;
  const offset = (circ * (1 - pct)).toFixed(1);

  const toggleEx = (i) => setCheckedEx(prev => prev.map((v, idx) => idx === i ? !v : v));
  const handleRoundDone = () => {
    if (!allChecked) return;
    beepRound();
    setCheckedEx(Array(exercises.length).fill(false));
    onRoundComplete();
  };

  return (
    <View style={s.wrap}>
      <View style={s.topRow}>
        <View style={s.svgWrap}>
          <Svg width={128} height={128} viewBox="0 0 128 128">
            <Circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={7} />
            <Circle cx={cx} cy={cy} r={R} fill="none" stroke={ringColor} strokeWidth={7}
              strokeDasharray={circ.toFixed(1)} strokeDashoffset={offset}
              strokeLinecap="round" transform={`rotate(-90, ${cx}, ${cy})`} />
          </Svg>
          <View style={s.svgOverlay}>
            <Text style={[s.timeText, isEnd && { color: C.red, fontSize: 13 }, isWarning && !isEnd && { color: C.orange }]}>
              {isEnd ? 'TIME!' : fmt(remaining)}
            </Text>
            <Text style={s.leftLbl}>LEFT</Text>
          </View>
        </View>
        <View style={s.statsCol}>
          <View style={s.roundBox}>
            <Text style={s.roundNum}>{roundCount}</Text>
            <Text style={s.roundLbl}>ROUNDS DONE</Text>
          </View>
          <View style={s.kbBox}>
            <Text style={s.kbLabel}>KB</Text>
            <Text style={s.kbVal}>{kbWeight || '—'} <Text style={s.kbUnit}>{unit}</Text></Text>
          </View>
        </View>
      </View>

      {!isEnd && (
        <>
          <View style={s.listCard}>
            <View style={s.listHeader}>
              <Text style={s.listHeaderText}>ROUND {roundCount + 1}</Text>
              <Text style={s.listCount}>{checkedEx.filter(Boolean).length}/{exercises.length} done</Text>
            </View>
            {resolvedExercises.map((ex, i) => {
              const checked = checkedEx[i];
              return (
                <TouchableOpacity key={ex.id} onPress={() => toggleEx(i)}
                  style={[s.exRow, checked && s.exRowChecked, i < exercises.length - 1 && s.exRowBorder]}>
                  <View style={[s.checkbox, checked && s.checkboxChecked]}>
                    {checked && <Text style={[s.checkMark, { color: C.purple }]}>✓</Text>}
                  </View>
                  <View style={s.exInfo}>
                    <Text style={[s.exName, checked && { color: C.purple, textDecorationLine: 'line-through' }]}>{ex.name}</Text>
                    <Text style={s.exDetail}>
                      {ex.id === 'amrap_pushup'
                        ? `${ex.resolvedReps} reps (½ of ${pushupMax} max)`
                        : (ex.id === 'amrap_squat_r' || ex.id === 'amrap_squat_l')
                          ? `${ex.resolvedReps} reps · hold KB in rack`
                          : `${ex.resolvedReps} reps · ${ex.muscle}`}
                    </Text>
                  </View>
                  <Text style={[s.exReps, { color: checked ? C.purple : C.muted }]}>×{ex.resolvedReps}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={handleRoundDone} disabled={!allChecked}
            style={[s.doneBtn, allChecked ? s.doneBtnActive : s.doneBtnInactive]}>
            <Text style={[s.doneBtnText, { color: allChecked ? '#fff' : C.muted }]}>
              {allChecked ? `✓ ROUND ${roundCount + 1} DONE — LOG IT` : 'CHECK ALL EXERCISES FIRST'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {isEnd && (
        <View style={s.endCard}>
          <Text style={s.endIcon}>⏱</Text>
          <Text style={s.endTitle}>TIME'S UP</Text>
          <Text style={s.endRounds}>{roundCount}</Text>
          <Text style={s.endSub}>ROUNDS COMPLETED</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: 14, marginBottom: 12 },
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'stretch' },
  svgWrap: { flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  svgOverlay: { position: 'absolute', alignItems: 'center' },
  timeText: { fontFamily: 'Oswald_700Bold', fontSize: 22, color: C.text, lineHeight: 22 },
  leftLbl: { fontSize: 8, color: C.muted, letterSpacing: 1, marginTop: 2 },
  statsCol: { flex: 1, gap: 8 },
  roundBox: { backgroundColor: C.purple + '18', borderWidth: 1, borderColor: C.purple + '30', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, flex: 1, justifyContent: 'center' },
  roundNum: { fontFamily: 'Oswald_700Bold', fontSize: 36, color: C.purple, lineHeight: 36 },
  roundLbl: { fontSize: 9, color: C.muted, letterSpacing: 1, marginTop: 2 },
  kbBox: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kbLabel: { fontSize: 10, color: C.muted },
  kbVal: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: C.text },
  kbUnit: { fontFamily: 'Oswald_400Regular', fontSize: 10, color: C.muted },
  listCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.purple + '30', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  listHeader: { paddingVertical: 9, paddingHorizontal: 14, backgroundColor: C.purple + '12', borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listHeaderText: { fontSize: 11, color: C.purple, letterSpacing: 1, fontFamily: 'Oswald_700Bold' },
  listCount: { fontSize: 10, color: C.muted },
  exRow: { paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  exRowChecked: { backgroundColor: C.purple + '08' },
  exRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  checkbox: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#0d1117', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: C.purple + '30', borderColor: C.purple },
  checkMark: { fontSize: 13 },
  exInfo: { flex: 1 },
  exName: { fontSize: 12, color: C.text, fontWeight: '600' },
  exDetail: { fontSize: 10, color: C.muted, marginTop: 1 },
  exReps: { fontFamily: 'Oswald_700Bold', fontSize: 16 },
  doneBtn: { width: '100%', borderRadius: 10, padding: 13, alignItems: 'center', borderWidth: 1 },
  doneBtnActive: { backgroundColor: C.purple, borderColor: C.purple + '80' },
  doneBtnInactive: { backgroundColor: '#1a1a2a', borderColor: C.purple + '20' },
  doneBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 14, letterSpacing: 1 },
  endCard: { backgroundColor: C.purple + '12', borderWidth: 1, borderColor: C.purple + '30', borderRadius: 12, padding: 16, alignItems: 'center' },
  endIcon: { fontSize: 30, marginBottom: 6 },
  endTitle: { fontFamily: 'Oswald_400Regular', fontSize: 20, color: C.purple, letterSpacing: 1 },
  endRounds: { fontFamily: 'Oswald_700Bold', fontSize: 40, color: C.text, marginTop: 4 },
  endSub: { fontSize: 11, color: C.muted, marginTop: 2 },
});
