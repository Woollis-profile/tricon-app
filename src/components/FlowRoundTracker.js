import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { C, WORKOUT_DEFS, fmt } from '../constants';
import { beepDone } from '../audio';

const wk = WORKOUT_DEFS.circuit;

export default function FlowRoundTracker({ exercises, roundTimes, currentRound, onCompleteRound, elapsed, kbWeight, unit, onKbWeightChange }) {
  const [editingKb, setEditingKb] = useState(false);
  const [kbDraft, setKbDraft] = useState(kbWeight || '');

  const handleRoundDone = () => {
    if (currentRound >= wk.rounds) return;
    beepDone();
    onCompleteRound(elapsed);
  };

  const handleSaveKb = () => {
    setEditingKb(false);
    if (onKbWeightChange) onKbWeightChange(kbDraft);
  };

  return (
    <View style={s.wrap}>
      <View style={s.kbBanner}>
        <Text style={s.kbBannerLabel}>KETTLEBELL</Text>
        {editingKb ? (
          <View style={s.kbEditRow}>
            <TextInput
              keyboardType="decimal-pad"
              value={kbDraft}
              onChangeText={setKbDraft}
              style={s.kbInput}
              maxLength={6}
              autoFocus
            />
            <Text style={s.kbUnit}>{unit}</Text>
            <TouchableOpacity onPress={handleSaveKb} style={s.kbSaveBtn}>
              <Text style={s.kbSaveBtnText}>✓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.kbValRow}>
            <Text style={s.kbVal}>{kbWeight || '—'}<Text style={s.kbUnit}> {unit}</Text></Text>
            <TouchableOpacity onPress={() => { setKbDraft(kbWeight || ''); setEditingKb(true); }} style={s.kbEditBtn}>
              <Text style={s.kbEditBtnText}>✎</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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

      {currentRound < wk.rounds ? (
        <TouchableOpacity onPress={handleRoundDone} style={s.doneBtn}>
          <Text style={s.doneBtnText}>ROUND {currentRound + 1} DONE ✓</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.completeCard}>
          <Text style={s.trophy}>🏆</Text>
          <Text style={s.completeTitle}>ALL 3 ROUNDS COMPLETE</Text>
          <Text style={s.completeSub}>Tap FINISH above to log your session</Text>
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
  kbBanner: { backgroundColor: C.card, borderWidth: 1, borderColor: C.green + '30', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 10 },
  kbBannerLabel: { fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 3 },
  kbValRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kbVal: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: C.text },
  kbUnit: { fontFamily: 'Oswald_400Regular', fontSize: 10, color: C.muted },
  kbEditBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  kbEditBtnText: { fontSize: 14, color: C.muted },
  kbEditRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kbInput: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.green + '50', borderRadius: 5, color: C.text, paddingVertical: 2, paddingHorizontal: 6, fontSize: 14, fontFamily: 'Oswald_700Bold', textAlign: 'center', minWidth: 44 },
  kbSaveBtn: { backgroundColor: C.green + '30', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  kbSaveBtnText: { color: C.green, fontSize: 13 },
  roundStrip: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  stripItem: { flex: 1, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  stripDone: { backgroundColor: 'rgba(76,175,125,0.15)', borderColor: 'rgba(76,175,125,0.4)' },
  stripActive: { backgroundColor: 'rgba(76,175,125,0.08)', borderColor: 'rgba(76,175,125,0.25)' },
  stripText: { fontFamily: 'Oswald_700Bold', fontSize: 18, lineHeight: 18 },
  stripSub: { fontSize: 8, letterSpacing: 1, marginTop: 3 },
  doneBtn: { width: '100%', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, backgroundColor: C.green, borderColor: 'rgba(76,175,125,0.6)' },
  doneBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1, color: '#0a0c0f' },
  completeCard: { backgroundColor: 'rgba(76,175,125,0.1)', borderWidth: 1, borderColor: 'rgba(76,175,125,0.3)', borderRadius: 12, padding: 14, alignItems: 'center' },
  trophy: { fontSize: 26, marginBottom: 6 },
  completeTitle: { fontFamily: 'Oswald_400Regular', fontSize: 17, color: C.green, letterSpacing: 1 },
  completeSub: { fontSize: 11, color: C.muted, marginTop: 6 },
  splitsRow: { flexDirection: 'row', gap: 8, marginTop: 10, width: '100%' },
  splitItem: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 7, paddingVertical: 7, paddingHorizontal: 4, alignItems: 'center' },
  splitTime: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: C.green },
  splitLbl: { fontSize: 8, color: C.muted, marginTop: 2 },
});
