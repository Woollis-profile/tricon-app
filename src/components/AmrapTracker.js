import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, AMRAP_TOTAL, fmt } from '../constants';
import { beepRound } from '../audio';

const R = 54, cx = 64, cy = 64, circ = 2 * Math.PI * R;

export default function AmrapTracker({ exercises, elapsed, pushupMax, kbWeight, unit, onRoundComplete, onKbWeightChange, roundCount }) {
  const [editingKb, setEditingKb] = useState(false);
  const [kbDraft, setKbDraft] = useState(kbWeight || '');

  const remaining = AMRAP_TOTAL - elapsed;
  const pct = Math.max(0, remaining / AMRAP_TOTAL);
  const isWarning = remaining <= 300;
  const isEnd = remaining <= 0;
  const ringColor = isEnd ? C.red : isWarning ? C.orange : C.purple;
  const offset = (circ * (1 - pct)).toFixed(1);

  const handleRoundDone = () => {
    beepRound();
    onRoundComplete();
  };

  const handleSaveKb = () => {
    setEditingKb(false);
    if (onKbWeightChange) onKbWeightChange(kbDraft);
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
                <Text style={s.kbUnit}> {unit}</Text>
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
        </View>
      </View>

      {isEnd ? (
        <View style={s.endCard}>
          <Text style={s.endIcon}>⏱</Text>
          <Text style={s.endTitle}>TIME'S UP</Text>
          <Text style={s.endRounds}>{roundCount}</Text>
          <Text style={s.endSub}>FULL ROUNDS COMPLETED</Text>
          <Text style={s.endHint}>Tap FINISH above to log your session</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={handleRoundDone} style={[s.doneBtn, s.doneBtnActive]}>
          <Text style={[s.doneBtnText, { color: '#fff' }]}>
            {`✓ ROUND ${roundCount + 1} DONE`}
          </Text>
        </TouchableOpacity>
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
  kbBox: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  kbLabel: { fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 3 },
  kbValRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kbVal: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: C.text },
  kbUnit: { fontFamily: 'Oswald_400Regular', fontSize: 10, color: C.muted },
  kbEditBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  kbEditBtnText: { fontSize: 14, color: C.muted },
  kbEditRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kbInput: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.purple + '50', borderRadius: 5, color: C.text, paddingVertical: 2, paddingHorizontal: 6, fontSize: 14, fontFamily: 'Oswald_700Bold', textAlign: 'center', minWidth: 44 },
  kbSaveBtn: { backgroundColor: C.purple + '30', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  kbSaveBtnText: { color: C.purple, fontSize: 13 },
  doneBtn: { width: '100%', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1 },
  doneBtnActive: { backgroundColor: C.purple, borderColor: C.purple + '80' },
  doneBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1 },
  endCard: { backgroundColor: C.purple + '12', borderWidth: 1, borderColor: C.purple + '30', borderRadius: 12, padding: 16, alignItems: 'center' },
  endIcon: { fontSize: 30, marginBottom: 6 },
  endTitle: { fontFamily: 'Oswald_400Regular', fontSize: 20, color: C.purple, letterSpacing: 1 },
  endRounds: { fontFamily: 'Oswald_700Bold', fontSize: 40, color: C.text, marginTop: 4 },
  endSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  endHint: { fontSize: 10, color: C.purple + 'aa', marginTop: 8, letterSpacing: 0.5 },
});
