import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, WORKOUT_DEFS, ALL_EX, CAT_COLOR, CAT_LABEL, PROG, TRICON_PHASES } from '../constants';
import { useAppContext } from '../context';

export default function LibraryScreen() {
  const { weekIdx } = useAppContext();
  const [libTab, setLibTab] = useState('method');
  const [libFilter, setLibFilter] = useState('all');
  const [libSearch, setLibSearch] = useState('');
  const [libOpen, setLibOpen] = useState(null);
  const prog = PROG[weekIdx];
  const phases = TRICON_PHASES(prog.hold);
  const filtered = ALL_EX.filter(e =>
    (libFilter === 'all' || e.cat === libFilter) &&
    e.name.toLowerCase().includes(libSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.headerArea}>
        <Text style={s.pageTitle}>LIBRARY</Text>
        <View style={s.tabRow}>
          {[['method', 'METHOD'], ['exercises', 'EXERCISES']].map(([v, l]) => (
            <TouchableOpacity key={v} onPress={() => setLibTab(v)}
              style={[s.tab, libTab === v && s.tabActive]}>
              <Text style={[s.tabText, libTab === v && s.tabTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {libTab === 'method' ? (
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          {/* TRICON */}
          <View style={s.methodCard}>
            <View style={s.methodCardHeader}>
              <Text style={s.methodCardAuthor}>OLDER AND WISER ATHLETES</Text>
              <Text style={s.methodCardTitle}>TRICON LIFTING METHOD</Text>
              <Text style={s.methodCardSub}>Monday & Wednesday · 9 reps per set</Text>
            </View>
            {phases.map((ph, i) => (
              <View key={i} style={[s.phaseBlock, { backgroundColor: ph.bg, borderLeftColor: ph.color }]}>
                <View style={s.phaseHead}>
                  <Text style={[s.phaseRange, { color: ph.color }]}>{ph.repRange}</Text>
                  <Text style={s.phaseName}>{ph.name}</Text>
                </View>
                {ph.steps.map((step, j) => (
                  <View key={j} style={[s.stepRow, { backgroundColor: ph.color + '12', borderColor: ph.color + '20' }]}>
                    <Text style={[s.stepTime, { color: ph.color }]}>{step.time}</Text>
                    <Text style={s.stepDesc}>{step.desc}</Text>
                  </View>
                ))}
                <Text style={s.phaseWhy}>{ph.why}</Text>
              </View>
            ))}
          </View>

          {/* KB Benchmark */}
          <View style={[s.methodCard, { borderColor: C.purple + '30' }]}>
            <View style={[s.methodCardHeader, { backgroundColor: C.purple + '10' }]}>
              <Text style={s.methodCardAuthor}>TREVOR'S INSTINCT</Text>
              <Text style={s.methodCardTitle}>KB BENCHMARK</Text>
              <Text style={s.methodCardSub}>Friday · AMRAP 30 min · One Kettlebell</Text>
            </View>
            <View style={{ borderLeftWidth: 3, borderLeftColor: C.purple }}>
              {WORKOUT_DEFS.amrap.exercises.map((ex, i) => (
                <View key={ex.id} style={[s.kbExRow, i < WORKOUT_DEFS.amrap.exercises.length - 1 && s.kbExRowBorder]}>
                  <View style={s.kbExTop}>
                    <View style={[s.kbExBadge, { backgroundColor: C.purple + '20' }]}>
                      <Text style={[s.kbExBadgeText, { color: C.purple }]}>{i + 1}</Text>
                    </View>
                    <View style={s.kbExInfo}>
                      <Text style={s.kbExName}>{ex.name}</Text>
                      <Text style={s.kbExMuscle}>{ex.muscle}</Text>
                    </View>
                    <Text style={[s.kbExReps, { color: C.purple }]}>{ex.id === 'amrap_pushup' ? '½max' : ex.reps}</Text>
                  </View>
                  <Text style={s.kbExNote}>{ex.note}</Text>
                </View>
              ))}
              <View style={[s.strategyBox, { backgroundColor: C.purple + '08' }]}>
                <View style={[s.strategyInner, { backgroundColor: C.purple + '12', borderColor: C.purple + '20' }]}>
                  <Text style={[s.strategyTitle, { color: C.purple }]}>AMRAP STRATEGY</Text>
                  <Text style={s.strategyText}>Move steadily — don't sprint round 1. Rest as needed between rounds. Aim to beat your round count every week. The push-up cap (½ max) prevents failure and keeps you moving for the full 30 minutes.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* KB Flow */}
          <View style={[s.methodCard, { borderColor: C.green + '30' }]}>
            <View style={[s.methodCardHeader, { backgroundColor: 'rgba(76,175,125,0.08)' }]}>
              <Text style={s.methodCardAuthor}>TREVOR'S INSTINCT</Text>
              <Text style={s.methodCardTitle}>KETTLEBELL FLOW</Text>
              <Text style={s.methodCardSub}>Friday · ~20–30 min · 3 Rounds For Time</Text>
            </View>
            <View style={{ borderLeftWidth: 3, borderLeftColor: C.green }}>
              {WORKOUT_DEFS.circuit.exercises.map((ex, i) => (
                <View key={ex.id} style={[s.kbExRow, i < WORKOUT_DEFS.circuit.exercises.length - 1 && s.kbExRowBorder]}>
                  <View style={s.kbExTop}>
                    <View style={[s.kbExBadge, { backgroundColor: 'rgba(76,175,125,0.18)' }]}>
                      <Text style={[s.kbExBadgeText, { color: C.green }]}>{i + 1}</Text>
                    </View>
                    <View style={s.kbExInfo}>
                      <Text style={s.kbExName}>{ex.name}</Text>
                      <Text style={s.kbExMuscle}>×{ex.reps}</Text>
                    </View>
                    <Text style={[s.kbExReps, { color: C.green }]}>×{ex.reps}</Text>
                  </View>
                  <Text style={s.kbExNote}>{ex.note}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={s.exFlex}>
          <View style={s.searchArea}>
            <TextInput
              style={s.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={C.muted}
              value={libSearch}
              onChangeText={setLibSearch}
            />
            <View style={s.filterRow}>
              {[['all', 'All'], ['upper', 'Upper'], ['lower', 'Lower'], ['circuit', 'Flow'], ['amrap', 'AMRAP']].map(([v, l]) => (
                <TouchableOpacity key={v} onPress={() => setLibFilter(v)}
                  style={[s.filterBtn,
                    libFilter === v
                      ? { backgroundColor: (CAT_COLOR[v] || C.accent) + '18', borderColor: CAT_COLOR[v] || C.accent }
                      : { backgroundColor: 'transparent', borderColor: C.border }]}>
                  <Text style={[s.filterBtnText, { color: libFilter === v ? (CAT_COLOR[v] || C.accent) : C.muted }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <ScrollView style={s.scroll} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 80 }}>
            {filtered.map(ex => {
              const col = CAT_COLOR[ex.cat];
              const isKB = ex.cat === 'circuit' || ex.cat === 'amrap';
              const open = libOpen === ex.id;
              return (
                <View key={ex.id} style={s.exCard}>
                  <TouchableOpacity onPress={() => setLibOpen(open ? null : ex.id)} style={s.exCardHeader}>
                    <View style={s.exCardInfo}>
                      <Text style={s.exCardName}>{ex.name}</Text>
                      <Text style={s.exCardMuscle}>{ex.muscle}</Text>
                    </View>
                    <View style={[s.exCatBadge, { backgroundColor: col + '1e' }]}>
                      <Text style={[s.exCatBadgeText, { color: col }]}>{CAT_LABEL[ex.cat]}</Text>
                    </View>
                  </TouchableOpacity>
                  {open && (
                    <View style={s.exCardBody}>
                      {ex.injury && (
                        <View style={s.injuryBox}>
                          <Text style={s.injuryText}>⚠ {ex.injury}</Text>
                        </View>
                      )}
                      {isKB ? (
                        <View style={[s.kbNoteBox, { backgroundColor: col + '0e', borderColor: col + '1e' }]}>
                          <Text style={[s.kbNoteTitle, { color: col }]}>
                            {ex.cat === 'amrap' ? 'KB BENCHMARK — AMRAP 30 MIN' : 'KETTLEBELL FLOW — 3 ROUNDS FOR TIME'}
                          </Text>
                          <Text style={s.kbNoteText}>{ex.note}</Text>
                          {ex.id === 'amrap_pushup' && (
                            <Text style={s.kbNoteFooter}>Reps = ½ your max push-ups (set in Settings ⚙)</Text>
                          )}
                        </View>
                      ) : (
                        <>
                          <Text style={s.triconLabel}>TRICON 9-REP SEQUENCE</Text>
                          {[['1–3 reps', 'Explosive up · 3s controlled down', C.orange],
                            ['3–6 reps', `3s down · ${prog.hold}s iso hold`, C.accent],
                            ['6–9 reps', '3s down · 3s up (full ROM)', C.green]].map(([r, d, c]) => (
                              <View key={r} style={[s.seqRow, { backgroundColor: c + '0d', borderColor: c + '1e' }]}>
                                <Text style={[s.seqReps, { color: c }]}>{r}</Text>
                                <Text style={s.seqDesc}>{d}</Text>
                              </View>
                            ))}
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + (isKB ? ' kettlebell trevorsinstinct' : ' tricon lifting technique'))}`)}
                        style={s.ytBtn}>
                        <Text style={s.ytText}>▶ Watch on YouTube</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  headerArea: { paddingTop: 16, paddingHorizontal: 14, paddingBottom: 0 },
  pageTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: C.text, letterSpacing: 1, marginBottom: 10 },
  tabRow: { flexDirection: 'row', gap: 6 },
  tab: { flex: 1, paddingVertical: 8, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems: 'center' },
  tabActive: { backgroundColor: C.card, borderBottomColor: C.accent },
  tabText: { fontSize: 11, fontFamily: 'Oswald_400Regular', letterSpacing: 1, color: C.muted },
  tabTextActive: { color: C.accent },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingBottom: 80, paddingTop: 12 },
  methodCard: { backgroundColor: '#0d1117', borderWidth: 1, borderColor: C.border, borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  methodCardHeader: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border, background: 'linear-gradient(135deg,rgba(200,169,110,0.14) 0%,rgba(232,136,58,0.07) 100%)' },
  methodCardAuthor: { fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 3 },
  methodCardTitle: { fontFamily: 'Oswald_700Bold', fontSize: 22, color: C.text },
  methodCardSub: { fontSize: 11, color: C.sub, marginTop: 3 },
  phaseBlock: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border, borderLeftWidth: 3 },
  phaseHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 8 },
  phaseRange: { fontSize: 10, fontWeight: '700', letterSpacing: 1, minWidth: 76 },
  phaseName: { fontFamily: 'Oswald_700Bold', fontSize: 17, color: C.text },
  stepRow: { flexDirection: 'row', gap: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 5, borderWidth: 1, marginBottom: 4, alignItems: 'center' },
  stepTime: { fontSize: 10, fontFamily: 'Oswald_700Bold', minWidth: 36 },
  stepDesc: { fontSize: 11, color: C.sub, lineHeight: 15, flex: 1 },
  phaseWhy: { fontSize: 10, color: C.muted, fontStyle: 'italic', marginTop: 6, lineHeight: 14 },
  kbExRow: { paddingVertical: 12, paddingHorizontal: 16 },
  kbExRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  kbExTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  kbExBadge: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  kbExBadgeText: { fontSize: 10, fontWeight: '700' },
  kbExInfo: { flex: 1 },
  kbExName: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: C.text },
  kbExMuscle: { fontSize: 10, color: C.muted },
  kbExReps: { fontFamily: 'Oswald_700Bold', fontSize: 18 },
  kbExNote: { fontSize: 11, color: C.sub, lineHeight: 17, paddingLeft: 34 },
  strategyBox: { padding: 12 },
  strategyInner: { borderWidth: 1, borderRadius: 7, padding: 9 },
  strategyTitle: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  strategyText: { fontSize: 11, color: C.muted, lineHeight: 17 },
  exFlex: { flex: 1 },
  searchArea: { paddingTop: 10, paddingHorizontal: 14, paddingBottom: 8 },
  searchInput: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 8, color: C.text, paddingVertical: 9, paddingHorizontal: 12, fontSize: 13, fontFamily: 'Oswald_400Regular' },
  filterRow: { flexDirection: 'row', gap: 5, marginTop: 8 },
  filterBtn: { flex: 1, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 0, alignItems: 'center', borderWidth: 1 },
  filterBtnText: { fontSize: 10, fontFamily: 'Oswald_700Bold', letterSpacing: 1 },
  exCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, marginBottom: 8, overflow: 'hidden' },
  exCardHeader: { paddingVertical: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  exCardInfo: { flex: 1 },
  exCardName: { fontSize: 13, color: C.text, fontWeight: '600' },
  exCardMuscle: { fontSize: 10, color: C.muted, marginTop: 2 },
  exCatBadge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 7 },
  exCatBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  exCardBody: { borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 10, paddingHorizontal: 13 },
  injuryBox: { backgroundColor: 'rgba(224,82,82,0.08)', borderWidth: 1, borderColor: 'rgba(224,82,82,0.2)', borderRadius: 5, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 8 },
  injuryText: { fontSize: 11, color: C.red },
  kbNoteBox: { borderWidth: 1, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8 },
  kbNoteTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  kbNoteText: { fontSize: 11, color: C.sub, lineHeight: 18 },
  kbNoteFooter: { fontSize: 10, color: C.muted, fontStyle: 'italic', marginTop: 4 },
  triconLabel: { fontSize: 10, color: C.accent, letterSpacing: 1, marginBottom: 6 },
  seqRow: { flexDirection: 'row', gap: 8, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 5, borderWidth: 1, marginBottom: 4, alignItems: 'center' },
  seqReps: { fontSize: 9, fontFamily: 'Oswald_700Bold', minWidth: 44 },
  seqDesc: { fontSize: 11, color: C.sub },
  ytBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(255,0,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start', gap: 5 },
  ytText: { fontSize: 11, color: '#ff6b6b', fontWeight: '700' },
});
