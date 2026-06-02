import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, PROG } from '../constants';
import { useAppContext } from '../context';
import { save } from '../storage';
import { KEYS } from '../constants';

export default function SettingsScreen() {
  const { sessions, setSessions, unit, setUnit, weekIdx, setWeekIdx, pushupMax, setPushupMax, kbWeight, setKbWeight, setLastWeights } = useAppContext();

  const clearData = () => {
    Alert.alert('Clear All Data', 'Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { setSessions([]); setLastWeights({}); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.pageTitle}>SETTINGS</Text>

        {/* KB Setup */}
        <View style={[s.section, { borderColor: C.purple + '40' }]}>
          <View style={[s.sectionHeader, { borderBottomColor: C.border }]}>
            <Text style={[s.sectionHeaderText, { color: C.purple }]}>KETTLEBELL SETUP</Text>
          </View>
          <View style={[s.row, { borderBottomColor: C.border }]}>
            <Text style={s.rowLabel}>KB WEIGHT (shown during AMRAP sessions)</Text>
            <View style={s.inputRow}>
              <TextInput
                keyboardType="decimal-pad"
                placeholder="e.g. 16"
                placeholderTextColor={C.muted}
                value={String(kbWeight)}
                onChangeText={val => { setKbWeight(val); save(KEYS.kbWeight, val); }}
                style={[s.bigInput, { borderColor: C.purple + '50' }]}
              />
              <Text style={s.inputUnit}>{unit}</Text>
            </View>
          </View>
          <View style={s.row}>
            <Text style={s.rowLabel}>PUSH-UP MAX (sets your per-round rep count)</Text>
            <View style={s.inputRow}>
              <TextInput
                keyboardType="number-pad"
                placeholder="e.g. 20"
                placeholderTextColor={C.muted}
                value={pushupMax > 0 ? String(pushupMax) : ''}
                onChangeText={val => { const v = parseInt(val) || 0; setPushupMax(v); save(KEYS.pushupMax, v); }}
                style={[s.bigInput, { borderColor: C.purple + '50' }]}
              />
              <Text style={s.inputUnit}>reps</Text>
            </View>
            {pushupMax > 0 && (
              <View style={[s.pushupPreview, { backgroundColor: C.purple + '10', borderColor: C.purple + '20' }]}>
                <Text style={s.pushupPreviewLabel}>Per-round push-ups</Text>
                <Text style={[s.pushupPreviewNum, { color: C.purple }]}>{Math.max(1, Math.floor(pushupMax / 2))} reps</Text>
              </View>
            )}
            <Text style={s.rowNote}>Test your max fresh, then enter it here. Update when your max improves.</Text>
          </View>
        </View>

        {/* Units */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionHeaderText, { color: C.accent }]}>UNITS</Text>
          </View>
          {[['kg', 'Kilograms (kg)'], ['lbs', 'Pounds (lbs)']].map(([v, l]) => (
            <TouchableOpacity key={v} onPress={() => setUnit(v)}
              style={[s.optRow, unit === v && { backgroundColor: C.accent + '0d' }]}>
              <Text style={s.optLabel}>{l}</Text>
              <View style={[s.radio, { borderColor: unit === v ? C.accent : C.muted, backgroundColor: unit === v ? C.accent : 'transparent' }]}>
                {unit === v && <Text style={s.radioCheck}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Week selector */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionHeaderText, { color: C.accent }]}>ACTIVE WEEK</Text>
          </View>
          {PROG.map((p, i) => (
            <TouchableOpacity key={i} onPress={() => setWeekIdx(i)}
              style={[s.weekRow, weekIdx === i && { backgroundColor: C.accent + '0d' }]}>
              <View>
                <Text style={[s.weekName, p.deload && { color: C.blue }]}>Wk {p.week} — {p.label}{p.deload ? ' (deload)' : ''}</Text>
                <Text style={s.weekDetail}>{p.sets} sets · {p.intensity} · {p.hold}s iso hold</Text>
              </View>
              {weekIdx === i && <Text style={s.weekActive}>ACTIVE</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Schedule */}
        <View style={[s.section, s.sectionPad]}>
          <Text style={[s.sectionHeaderText, { color: C.accent, marginBottom: 8 }]}>SCHEDULE</Text>
          {[
            ['Monday', 'Upper Body', 'TRICON lifting · 60 min', C.accent],
            ['Wednesday', 'Lower Body', 'TRICON lifting · 60 min', C.blue],
            ['Friday', 'KB Benchmark or Flow', 'AMRAP 30 min · or 3 Rounds For Time', C.purple],
          ].map(([day, name, detail, col]) => (
            <View key={day} style={s.schedRow}>
              <View>
                <Text style={s.schedDay}>{day} — {name}</Text>
                <Text style={s.schedDetail}>{detail}</Text>
              </View>
              <View style={[s.schedDot, { backgroundColor: col }]} />
            </View>
          ))}
        </View>

        {/* Data */}
        <View style={[s.section, s.sectionPad]}>
          <Text style={[s.sectionHeaderText, { color: C.accent, marginBottom: 8 }]}>DATA</Text>
          <Text style={s.dataText}>Sessions saved: <Text style={{ color: C.green, fontWeight: '700' }}>{sessions.length}</Text></Text>
          {sessions.length > 0 && (
            <TouchableOpacity onPress={clearData} style={s.clearBtn}>
              <Text style={s.clearBtnText}>CLEAR ALL DATA</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 80 },
  pageTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: C.text, letterSpacing: 1, marginBottom: 16 },
  section: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  sectionPad: { padding: 12 },
  sectionHeader: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionHeaderText: { fontSize: 16, letterSpacing: 1, fontWeight: '700' },
  row: { paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 14, color: C.muted, letterSpacing: 1, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bigInput: { flex: 1, backgroundColor: '#0d1117', borderWidth: 1, borderRadius: 8, color: C.text, paddingVertical: 12, paddingHorizontal: 14, fontSize: 22, fontFamily: 'Oswald_700Bold', textAlign: 'center' },
  inputUnit: { fontSize: 13, color: C.muted, fontWeight: '700' },
  pushupPreview: { marginTop: 10, borderWidth: 1, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pushupPreviewLabel: { fontSize: 11, color: C.muted },
  pushupPreviewNum: { fontFamily: 'Oswald_700Bold', fontSize: 20 },
  rowNote: { fontSize: 14, color: C.muted, marginTop: 8, lineHeight: 20 },
  optRow: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border },
  optLabel: { fontSize: 13, color: C.text },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioCheck: { fontSize: 10, color: '#0a0c0f', fontWeight: '700' },
  weekRow: { paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekName: { fontSize: 14, color: C.text },
  weekDetail: { fontSize: 14, color: C.muted, marginTop: 1 },
  weekActive: { fontSize: 9, color: C.accent, fontWeight: '700', letterSpacing: 1, fontFamily: 'Oswald_700Bold' },
  schedRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  schedDay: { fontSize: 14, color: C.text, fontWeight: '600' },
  schedDetail: { fontSize: 14, color: C.muted, marginTop: 2 },
  schedDot: { width: 8, height: 8, borderRadius: 4 },
  dataText: { fontSize: 14, color: C.sub, lineHeight: 22 },
  clearBtn: { marginTop: 10, backgroundColor: 'rgba(224,82,82,0.1)', borderWidth: 1, borderColor: 'rgba(224,82,82,0.25)', borderRadius: 7, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' },
  clearBtnText: { color: C.red, fontSize: 11, fontWeight: '700', fontFamily: 'Oswald_700Bold', letterSpacing: 1 },
});
