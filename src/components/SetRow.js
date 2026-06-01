import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants';

export default function SetRow({ setNum, weight, reps, status, onDone, onRepsChange, unit }) {
  const isDone = status === 'done', isActive = status === 'active';
  const [localReps, setLocalReps] = useState(reps);
  const warn = parseInt(localReps) !== 9;

  return (
    <View style={[s.row, isDone && s.rowDone, isActive && s.rowActive]}>
      <Text style={[s.setNum, isDone ? { color: C.green } : isActive ? { color: C.accent } : { color: C.muted }]}>
        {isDone ? '✓' : `S${setNum}`}
      </Text>
      <Text style={[s.weight, isDone ? { color: C.green } : isActive ? { color: C.text } : { color: C.muted }]}>
        {weight || '—'}
      </Text>
      <View style={s.repsCol}>
        <TextInput
          keyboardType="number-pad"
          value={localReps}
          editable={!isDone && status !== 'pending'}
          onChangeText={val => { setLocalReps(val); onRepsChange(val); }}
          style={[
            s.repsInput,
            isDone || status === 'pending' ? s.repsInputDisabled : s.repsInputEnabled,
            isActive && s.repsInputActive,
            { color: isDone ? C.green : status === 'pending' ? C.muted : C.text },
          ]}
        />
        {warn && !isDone && isActive && <Text style={s.warn}>≠9</Text>}
      </View>
      <View style={s.doneCol}>
        <TouchableOpacity
          onPress={() => { if (isActive) onDone(); }}
          disabled={!isActive}
          style={[s.doneBtn, isDone ? s.doneBtnDone : isActive ? s.doneBtnActive : s.doneBtnPending]}
        >
          <Text style={[s.doneBtnText, { color: isDone ? C.green : isActive ? '#0a0c0f' : C.muted }]}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, paddingHorizontal: 14,
    borderTopWidth: 1, borderTopColor: '#0d1117',
    backgroundColor: C.card,
  },
  rowDone: { backgroundColor: 'rgba(76,175,125,0.06)' },
  rowActive: { backgroundColor: 'rgba(200,169,110,0.07)' },
  setNum: { width: 32, fontSize: 11, fontFamily: 'Oswald_700Bold' },
  weight: { flex: 1, fontSize: 18, fontFamily: 'Oswald_700Bold', textAlign: 'center', paddingHorizontal: 6 },
  repsCol: { width: 72, alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  repsInput: {
    width: '100%', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 4,
    fontSize: 14, fontFamily: 'Oswald_700Bold', textAlign: 'center',
    borderWidth: 1,
  },
  repsInputDisabled: { backgroundColor: '#0d1117', borderColor: C.border },
  repsInputEnabled: { backgroundColor: C.surface, borderColor: C.border },
  repsInputActive: { borderColor: 'rgba(200,169,110,0.4)' },
  warn: { fontSize: 7, color: C.red },
  doneCol: { width: 40, alignItems: 'center', justifyContent: 'center' },
  doneBtn: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  doneBtnDone: { backgroundColor: 'rgba(76,175,125,0.18)', borderWidth: 1, borderColor: 'rgba(76,175,125,0.28)' },
  doneBtnActive: { backgroundColor: C.accent },
  doneBtnPending: { backgroundColor: '#1e2530' },
  doneBtnText: { fontSize: 15, fontWeight: '700' },
});
