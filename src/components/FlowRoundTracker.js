import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, WORKOUT_DEFS, fmt } from '../constants';
import { beepDone } from '../audio';

const wk = WORKOUT_DEFS.circuit;

export default function FlowRoundTracker({ exercises, roundTimes, currentRound, onCompleteRound, elapsed }) {
  const [checkedEx, setCheckedEx] = useState(Array(exercises.length).fill(false));
  const allChecked = checkedEx.every(Boolean);

  const toggleEx = (i) => {
    if (currentRound >= wk.rounds) return;
    setCheckedEx(prev => prev.map((v, idx) => idx === i ? !v : v));
  };
  const handleRoundDone = () => {
    if (!allChecked) return;
    beepDone();
    setCheckedEx(Array(exercises.length).fill(false));
    onCompleteRound(elapsed);
  };

  return (
    <View style={s.wrap}>
      <View style={s.roundStrip}>
        {Array.from({ length: wk.rounds }, (_, i) => {
          const done = i < roundTimes.length;
          const active = i === roundTimes.length && i < wk.rounds;
          return (
            <View key={i} style={[s.stripItem, done && s.stripDone, active && s.stripActive]}>
              <Text style={[s.stripText, done ? { color: C.green } : active ? { color: C.text } : { color: C.muted }]}>
                {done ? fmt(roundTimes[i]) : `R${i + 1}`}
              </Text>
              <Text style={[s.stripSub, done ? { color: C.green } : active ? { color: C.green } : { color: C.muted }]}>
                {done ? 'DONE' : active ? 'ACTIVE' : 'WAITING'}
              </Text>
            </View>
          );
        })}
      </View>

      {currentRound < wk.rounds && (
        <>
          <View style={s.listCard}>
            <View style={s.listHeader}>
              <Text style={s.listHeaderText}>ROUND {currentRound + 1} OF {wk.rounds}</Text>
              <Text style={s.listCount}>{checkedEx.filter(Boolean).length}/{exercises.length} done</Text>
            </View>
            {exercises.map((ex, i) => {
              const checked = checkedEx[i];
              return (
                <TouchableOpacity key={ex.id} onPress={() => toggleEx(i)}
                  style={[s.exRow, checked && s.exRowChecked, i < exercises.length - 1 && s.exRowBorder]}>
                  <View style={[s.checkbox, checked && s.checkboxChecked]}>
                    {checked && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <View style={s.exInfo}>
                    <Text style={[s.exName, checked && s.exNameDone]}>{ex.name}</Text>
                    <Text style={s.exDetail}>{ex.reps} reps · {ex.muscle}</Text>
                  </View>
                  <Text style={[s.exReps, { color: checked ? C.green : C.muted }]}>×{ex.reps}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={handleRoundDone} disabled={!allChecked}
            style={[s.doneBtn, allChecked ? s.doneBtnActive : s.doneBtnInactive]}>
            <Text style={[s.doneBtnText, { color: allChecked ? '#0a0c0f' : C.muted }]}>
              {allChecked ? `✓ ROUND ${currentRound + 1} COMPLETE — STAMP TIME` : 'CHECK ALL EXERCISES TO LOG ROUND'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {currentRound >= wk.rounds && (
        <View style={s.completeCard}>
          <Text style={s.trophy}>🏆</Text>
          <Text style={s.completeTitle}>ALL 3 ROUNDS COMPLETE</Text>
          <Text style={s.completeSub}>Total time: {fmt(elapsed)}</Text>
          <View style={s.splitsRow}>
            {roundTimes.map((t, i) => (
              <View key={i} style={s.splitItem}>
                <Text style={s.splitTime}>{fmt(t)}</Text>
                <Text style={s.splitLbl}>R{i + 1}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: 14, marginBottom: 12 },
  roundStrip: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  stripItem: { flex: 1, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  stripDone: { backgroundColor: 'rgba(76,175,125,0.15)', borderColor: 'rgba(76,175,125,0.4)' },
  stripActive: { backgroundColor: 'rgba(76,175,125,0.08)', borderColor: 'rgba(76,175,125,0.25)' },
  stripText: { fontFamily: 'Oswald_700Bold', fontSize: 18, lineHeight: 18 },
  stripSub: { fontSize: 8, letterSpacing: 1, marginTop: 3 },
  listCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.green + '30', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  listHeader: { paddingVertical: 9, paddingHorizontal: 14, backgroundColor: 'rgba(76,175,125,0.08)', borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listHeaderText: { fontSize: 11, color: C.green, letterSpacing: 1, fontFamily: 'Oswald_700Bold' },
  listCount: { fontSize: 10, color: C.muted },
  exRow: { paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  exRowChecked: { backgroundColor: 'rgba(76,175,125,0.06)' },
  exRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  checkbox: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#0d1117', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: 'rgba(76,175,125,0.25)', borderColor: 'rgba(76,175,125,0.5)' },
  checkMark: { fontSize: 13, color: C.green },
  exInfo: { flex: 1 },
  exName: { fontSize: 12, color: C.text, fontWeight: '600' },
  exNameDone: { color: C.green, textDecorationLine: 'line-through' },
  exDetail: { fontSize: 10, color: C.muted, marginTop: 1 },
  exReps: { fontFamily: 'Oswald_700Bold', fontSize: 16 },
  doneBtn: { width: '100%', borderRadius: 10, padding: 13, alignItems: 'center', borderWidth: 1 },
  doneBtnActive: { backgroundColor: C.green, borderColor: 'rgba(76,175,125,0.6)' },
  doneBtnInactive: { backgroundColor: '#1a2a1a', borderColor: 'rgba(76,175,125,0.15)' },
  doneBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 14, letterSpacing: 1 },
  completeCard: { backgroundColor: 'rgba(76,175,125,0.1)', borderWidth: 1, borderColor: 'rgba(76,175,125,0.3)', borderRadius: 12, padding: 14, alignItems: 'center' },
  trophy: { fontSize: 26, marginBottom: 6 },
  completeTitle: { fontFamily: 'Oswald_400Regular', fontSize: 17, color: C.green, letterSpacing: 1 },
  completeSub: { fontSize: 11, color: C.muted, marginTop: 6 },
  splitsRow: { flexDirection: 'row', gap: 8, marginTop: 10, width: '100%' },
  splitItem: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 7, paddingVertical: 7, paddingHorizontal: 4, alignItems: 'center' },
  splitTime: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: C.green },
  splitLbl: { fontSize: 8, color: C.muted, marginTop: 2 },
});
