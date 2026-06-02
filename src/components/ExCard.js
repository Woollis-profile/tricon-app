import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { C, CAT_COLOR } from '../constants';
import SetRow from './SetRow';

export default function ExCard({ ex, exData: d, exIdx, isOpen, onToggle, onDone, onWeightChange, onRepsChange, prog, unit, wkType }) {
  const doneCount = d.sets.filter(s => s.done).length;
  const allDone = doneCount === d.sets.length;
  const nextSi = d.sets.findIndex(s => !s.done);
  const isStarted = doneCount > 0;
  const col = CAT_COLOR[wkType] || C.accent;

  const borderColor = allDone ? 'rgba(76,175,125,0.45)' : isStarted ? col + '55' : C.border;
  const weightLabel = doneCount === 0
    ? `SET WEIGHT FOR ALL ${d.sets.length} SETS`
    : doneCount < d.sets.length
      ? `UPDATE WEIGHT FOR REMAINING ${d.sets.length - doneCount} SETS`
      : 'ALL SETS COMPLETE';

  return (
    <View style={[s.card, { borderColor }]}>
      <TouchableOpacity onPress={onToggle} style={s.header}>
        <View style={[s.badge, { backgroundColor: allDone ? 'rgba(76,175,125,0.22)' : col + '28' }]}>
          <Text style={[s.badgeText, { color: allDone ? C.green : col }]}>{allDone ? '✓' : exIdx + 1}</Text>
        </View>
        <View style={s.headerInfo}>
          <Text style={s.exName}>{ex.name}</Text>
          <Text style={s.exSub}>{ex.muscle} · {d.sets.length} sets × 9 reps</Text>
          <View style={s.progressBar}>
            {d.sets.map((_, si) => (
              <View key={si} style={[s.progressDot, {
                backgroundColor: si < doneCount ? C.green : (si === nextSi && !allDone) ? col : C.border,
              }]} />
            ))}
          </View>
        </View>
        {ex.injury && <Text style={s.injuryWarn}>⚠</Text>}
        <Text style={s.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <>
          {/* Weight always editable — affects current and future sets only */}
          <View style={s.weightRow}>
            <Text style={s.weightLabel}>{weightLabel}</Text>
            <View style={s.weightInput}>
              <TextInput
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={C.muted}
                value={String(d.weight || '')}
                onChangeText={onWeightChange}
                style={[s.weightField, { borderColor: col + '55' }]}
                editable={!allDone}
              />
              <Text style={s.weightUnit}>{unit}</Text>
            </View>
          </View>

          {ex.injury && (
            <View style={s.injuryBox}>
              <Text style={s.injuryText}>⚠ {ex.injury}</Text>
            </View>
          )}

          <View style={s.phaseRow}>
            {[
              ['1–3', `EXP↑ · 3s↓`, C.orange, 'rgba(232,136,58,0.09)', 'rgba(232,136,58,0.2)'],
              ['4–6', `3s↓ · ${prog.hold}s⏸`, C.accent, 'rgba(200,169,110,0.09)', 'rgba(200,169,110,0.2)'],
              ['7–9', '3s↓ · 3s↑', C.green, 'rgba(76,175,125,0.09)', 'rgba(76,175,125,0.2)'],
            ].map(([n, t, c, bg, bdr]) => (
              <View key={n} style={[s.phaseCell, { backgroundColor: bg, borderColor: bdr }]}>
                <Text style={[s.phaseReps, { color: c }]}>REPS {n}</Text>
                <Text style={s.phaseTiming}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={s.colHeader}>
            {['SET', unit.toUpperCase(), 'REPS', 'DONE'].map((h, i) => (
              <Text key={i} style={[s.colHeaderText, i > 0 && s.colHeaderCenter, i === 0 && { width: 32 }, i === 2 && { width: 72 }, i === 3 && { width: 40 }]}>{h}</Text>
            ))}
          </View>

          {d.sets.map((sData, si) => (
            <SetRow key={si} setNum={si + 1}
              weight={sData.done ? (sData.weight || d.weight) : d.weight}
              reps={sData.reps} unit={unit}
              status={sData.done ? 'done' : si === nextSi ? 'active' : 'pending'}
              onDone={() => onDone(si)} onRepsChange={val => onRepsChange(si, val)} />
          ))}

          <View style={s.footer}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' tricon Gary Walker')}`)}
              style={s.ytBtn}
            >
              <Text style={s.ytText}>▶ Watch technique</Text>
            </TouchableOpacity>
            <Text style={s.setsCount}>{doneCount}/{d.sets.length} sets</Text>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1, borderRadius: 12, marginHorizontal: 14, marginBottom: 10, overflow: 'hidden' },
  header: { paddingVertical: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 12, fontFamily: 'Oswald_700Bold' },
  headerInfo: { flex: 1 },
  exName: { fontSize: 14, color: C.text, letterSpacing: 0.4 },
  exSub: { fontSize: 10, color: C.muted, marginTop: 2 },
  progressBar: { flexDirection: 'row', gap: 4, marginTop: 5 },
  progressDot: { height: 3, flex: 1, borderRadius: 2 },
  injuryWarn: { fontSize: 10, color: C.red, fontWeight: '700', marginRight: 4 },
  chevron: { color: C.muted, fontSize: 11 },
  weightRow: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: '#0d1117' },
  weightLabel: { fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 },
  weightInput: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightField: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderRadius: 8, color: C.text, paddingVertical: 10, paddingHorizontal: 12, fontSize: 20, fontFamily: 'Oswald_700Bold', textAlign: 'center' },
  weightUnit: { fontSize: 11, color: C.muted },
  injuryBox: { backgroundColor: 'rgba(224,82,82,0.08)', borderWidth: 1, borderColor: 'rgba(224,82,82,0.2)', borderRadius: 6, paddingVertical: 7, paddingHorizontal: 10, marginHorizontal: 14, marginTop: 8 },
  injuryText: { fontSize: 11, color: C.red },
  phaseRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#0a0c0f', borderTopWidth: 1, borderTopColor: C.border },
  phaseCell: { flex: 1, borderWidth: 1, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 4, alignItems: 'center' },
  phaseReps: { fontSize: 13, fontFamily: 'Oswald_700Bold', letterSpacing: 1 },
  phaseTiming: { fontSize: 10, color: C.sub, marginTop: 2 },
  colHeader: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: C.border },
  colHeaderText: { flex: 1, fontSize: 9, color: C.muted, letterSpacing: 1, fontWeight: '700' },
  colHeaderCenter: { textAlign: 'center' },
  footer: { paddingTop: 7, paddingBottom: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ytBtn: { backgroundColor: 'rgba(255,0,0,0.09)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10 },
  ytText: { fontSize: 10, color: '#ff6b6b', fontWeight: '700' },
  setsCount: { fontSize: 10, color: C.muted },
});
