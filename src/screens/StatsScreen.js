import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, ALL_EX, CAT_COLOR, CAT_LABEL, buildExHistory, weekWeightFromHistory, weekChangeFromHistory, getWeekStart } from '../constants';
import { useAppContext } from '../context';
import TopBar from '../components/TopBar';

function WeightChart({ data, col, unit }) {
  const [chartW, setChartW] = useState(0);
  const CHART_H = 80, PAD_X = 10, PAD_Y = 10;
  if (data.length < 2) return null;
  const pts = [...data].reverse().slice(-10);
  const weights = pts.map(d => d.weight);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const points = chartW > 0 ? pts.map((d, i) => ({
    x: PAD_X + (i / (pts.length - 1)) * (chartW - 2 * PAD_X),
    y: PAD_Y + (1 - (d.weight - minW) / range) * (CHART_H - 2 * PAD_Y),
  })) : [];
  const segments = points.slice(0, -1).map((a, i) => {
    const b = points[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    return { len: Math.sqrt(dx * dx + dy * dy), angle: Math.atan2(dy, dx) * 180 / Math.PI, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
  });
  return (
    <View style={s.chartWrap}>
      <View style={{ height: CHART_H, position: 'relative' }} onLayout={e => setChartW(e.nativeEvent.layout.width)}>
        {chartW > 0 && (<>
          {segments.map((seg, i) => (
            <View key={i} style={{ position: 'absolute', left: seg.cx - seg.len / 2, top: seg.cy - 1, width: seg.len, height: 2, backgroundColor: col, opacity: 0.75, transform: [{ rotate: `${seg.angle}deg` }] }} />
          ))}
          {points.map((p, i) => (
            <View key={i} style={{ position: 'absolute', left: p.x - 3, top: p.y - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: i === points.length - 1 ? col : col + 'aa' }} />
          ))}
          <Text style={{ position: 'absolute', right: 0, top: 0, fontSize: 8, color: C.muted }}>{maxW} {unit}</Text>
          <Text style={{ position: 'absolute', right: 0, bottom: 0, fontSize: 8, color: C.muted }}>{minW} {unit}</Text>
        </>)}
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { sessions, unit } = useAppContext();
  const [statsTab, setStatsTab] = useState('exercises');
  const [catFilter, setCatFilter] = useState('all');
  const [drillEx, setDrillEx] = useState(null);
  const history = buildExHistory(sessions);
  const wS = getWeekStart(0);
  const tp = { upper: 0, lower: 0, circuit: 0, amrap: 0 };
  sessions.forEach(s => { if (tp[s.type] !== undefined) tp[s.type]++; });

  if (drillEx) {
    const ex = ALL_EX.find(e => e.id === drillEx);
    const col = CAT_COLOR[ex.cat];
    const exHist = (history[ex.id] || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    const currentW = exHist[0]?.weight ?? null;
    const prevW = exHist[1]?.weight ?? null;
    const absChg = (currentW !== null && prevW !== null) ? currentW - prevW : null;
    const pctChg = (absChg !== null && prevW !== 0) ? (absChg / prevW) * 100 : null;
    const absChgStr = absChg !== null ? `${absChg > 0 ? '+' : ''}${absChg.toFixed(1)} ${unit}` : '—';
    const pctChgStr = pctChg !== null ? `${pctChg > 0 ? '+' : ''}${pctChg.toFixed(1)}%` : '—';
    const chgCol = absChg === null ? C.muted : absChg > 0 ? C.green : absChg < 0 ? C.red : C.muted;

    return (
      <View style={s.screen}>
        <TopBar title={ex.name} onBack={() => setDrillEx(null)}
          right={<View style={[s.catBadge, { backgroundColor: col + '18' }]}><Text style={[s.catBadgeText, { color: col }]}>{CAT_LABEL[ex.cat]}</Text></View>} />
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={s.drillStats}>
            {[
              { val: currentW !== null ? currentW : '—', val2: null, lbl: `LATEST\n${unit}`, col: C.text, bg: C.card, bdr: C.border },
              { val: prevW !== null ? prevW : '—', val2: null, lbl: `PREV SESSION\n${unit}`, col: C.muted, bg: C.card, bdr: C.border },
              { val: absChgStr, val2: pctChgStr, lbl: 'CHANGE', col: chgCol, bg: col + '12', bdr: col + '30' },
            ].map((st, i) => (
              <View key={i} style={[s.drillStat, { backgroundColor: st.bg, borderColor: st.bdr }]}>
                <Text style={[s.drillStatNum, { color: st.col }]}>{st.val}</Text>
                {st.val2 ? <Text style={[s.drillStatPct, { color: st.col }]}>{st.val2}</Text> : null}
                <Text style={s.drillStatLbl}>{st.lbl}</Text>
              </View>
            ))}
          </View>
          <WeightChart data={exHist} col={col} unit={unit} />
          <View style={s.histArea}>
            <Text style={s.histLabel}>SESSION LOG</Text>
            {exHist.length === 0 && <Text style={s.noData}>No sessions logged yet.</Text>}
            {exHist.slice(0, 8).map((h, i) => (
              <View key={i} style={s.histRow}>
                <Text style={s.histDate}>{new Date(h.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                <Text style={s.histWeight}>{h.weight} <Text style={s.histUnit}>{unit}</Text></Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.headerArea}>
        <Text style={s.pageTitle}>STATISTICS</Text>
        <View style={s.tabRow}>
          {[['exercises', 'BY EXERCISE'], ['overview', 'OVERVIEW']].map(([v, l]) => (
            <TouchableOpacity key={v} onPress={() => setStatsTab(v)}
              style={[s.tab, statsTab === v && s.tabActive]}>
              <Text style={[s.tabText, statsTab === v && s.tabTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100, backgroundColor: C.bg }}>
        {statsTab === 'exercises' ? (
          <>
            <View style={s.filterRow}>
              {[['all', 'All'], ['upper', 'Upper'], ['lower', 'Lower'], ['circuit', 'Flow'], ['amrap', 'AMRAP']].map(([v, l]) => (
                <TouchableOpacity key={v} onPress={() => setCatFilter(v)}
                  style={[s.filterBtn,
                    catFilter === v
                      ? { backgroundColor: (CAT_COLOR[v] || C.accent) + '18', borderColor: CAT_COLOR[v] || C.accent }
                      : { borderColor: C.border }]}>
                  <Text style={[s.filterBtnText, { color: catFilter === v ? (CAT_COLOR[v] || C.accent) : C.muted }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(catFilter === 'all' ? ['upper', 'lower', 'circuit', 'amrap'] : [catFilter]).map(cat => {
              const exList = ALL_EX.filter(e => e.cat === cat);
              const col = CAT_COLOR[cat];
              return (
                <View key={cat}>
                  <View style={[s.catHeader, { backgroundColor: col + '0a', borderTopColor: col + '22', borderBottomColor: col + '22' }]}>
                    <Text style={[s.catHeaderText, { color: col }]}>{CAT_LABEL[cat]}</Text>
                  </View>
                  {exList.map(ex => {
                    const tw2 = weekWeightFromHistory(history, ex.id, 0);
                    const lw2 = weekWeightFromHistory(history, ex.id, -1);
                    const absChg2 = (tw2 !== null && lw2 !== null) ? tw2 - lw2 : null;
                    const chgCol2 = absChg2 === null ? C.muted : absChg2 > 0 ? C.green : absChg2 < 0 ? C.red : C.muted;
                    return (
                      <TouchableOpacity key={ex.id} onPress={() => setDrillEx(ex.id)} style={s.exRow}>
                        <View style={[s.exDot, { backgroundColor: col }]} />
                        <View style={s.exInfo}>
                          <Text style={s.exName}>{ex.name}</Text>
                          <Text style={s.exMuscle}>{ex.muscle}</Text>
                        </View>
                        <View style={s.exWeight}>
                          {tw2 !== null ? (
                            <>
                              <Text style={s.exWeightNum}>{tw2}<Text style={s.exWeightUnit}> {unit}</Text></Text>
                              {absChg2 !== null && (
                                <Text style={[s.exChgText, { color: chgCol2 }]}>
                                  {absChg2 > 0 ? '+' : ''}{absChg2.toFixed(1)}
                                </Text>
                              )}
                            </>
                          ) : (
                            <Text style={s.exNoData}>NO DATA</Text>
                          )}
                        </View>
                        <Text style={s.exChevron}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </>
        ) : (
          <>
            <View style={s.overviewCard}>
              <Text style={s.overviewLabel}>SESSIONS BY TYPE</Text>
              {[['upper', 'Upper Lift', C.accent], ['lower', 'Lower Body', C.blue], ['circuit', 'Kettlebell Flow', C.green], ['amrap', 'KB Benchmark', C.purple]].map(([k, l, col]) => (
                <View key={k} style={s.typeRow}>
                  <View style={s.typeRowTop}>
                    <Text style={s.typeName}>{l}</Text>
                    <Text style={[s.typeCount, { color: col }]}>{tp[k]}</Text>
                  </View>
                  <View style={s.typeBar}>
                    <View style={[s.typeBarFill, { width: `${(tp[k] / (sessions.length || 1)) * 100}%`, backgroundColor: col }]} />
                  </View>
                </View>
              ))}
            </View>
            {sessions.length === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>📊</Text>
                <Text style={s.emptyText}>Complete your first session to see stats</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  headerArea: { paddingTop: 18, paddingHorizontal: 14, paddingBottom: 0 },
  pageTitle: { fontFamily: 'Oswald_700Bold', fontSize: 20, color: C.text, letterSpacing: 1, marginBottom: 12 },
  tabRow: { flexDirection: 'row', gap: 6 },
  tab: { flex: 1, paddingVertical: 8, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems: 'center' },
  tabActive: { backgroundColor: C.card, borderBottomColor: C.accent },
  tabText: { fontSize: 11, fontFamily: 'Oswald_400Regular', letterSpacing: 1, color: C.muted },
  tabTextActive: { color: C.accent },
  scroll: { flex: 1 },
  catBadge: { borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  drillStats: { flexDirection: 'row', gap: 7, paddingHorizontal: 14, paddingTop: 12 },
  drillStat: { flex: 1, borderWidth: 1, borderRadius: 9, paddingTop: 16, paddingBottom: 11, paddingHorizontal: 8, alignItems: 'center', minHeight: 80 },
  drillStatNum: { fontFamily: 'Oswald_700Bold', fontSize: 26, lineHeight: 26 },
  drillStatPct: { fontFamily: 'Oswald_400Regular', fontSize: 12, marginTop: 2 },
  drillStatLbl: { fontSize: 8, color: C.muted, marginTop: 4, letterSpacing: 1, lineHeight: 12, textAlign: 'center' },
  chartWrap: { marginHorizontal: 14, marginTop: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10 },
  histArea: { paddingHorizontal: 14, paddingTop: 12 },
  histLabel: { fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 },
  noData: { fontSize: 12, color: C.muted, paddingVertical: 12 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  histDate: { flex: 1, fontSize: 12, color: C.text },
  histWeight: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: C.text },
  histUnit: { fontFamily: 'Oswald_400Regular', fontSize: 10, color: C.muted },
  filterRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, flexWrap: 'wrap' },
  filterBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1 },
  filterBtnText: { fontSize: 10, fontFamily: 'Oswald_700Bold', letterSpacing: 1 },
  catHeader: { paddingVertical: 6, paddingHorizontal: 14, borderTopWidth: 1, borderBottomWidth: 1 },
  catHeaderText: { fontSize: 9, letterSpacing: 2, fontWeight: '700' },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#111318' },
  exDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  exInfo: { flex: 1 },
  exName: { fontSize: 13, color: C.text, fontWeight: '600' },
  exMuscle: { fontSize: 10, color: C.muted, marginTop: 1 },
  exWeight: { marginRight: 8 },
  exWeightNum: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: C.text },
  exWeightUnit: { fontFamily: 'Oswald_400Regular', fontSize: 10, color: C.muted },
  exNoData: { fontSize: 11, color: C.border },
  exChgText: { fontSize: 10, fontWeight: '600', textAlign: 'right', marginTop: 1 },
  exChevron: { color: C.muted, fontSize: 11 },
  overviewCard: { marginHorizontal: 14, marginTop: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 13 },
  overviewLabel: { fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 10 },
  typeRow: { marginBottom: 10 },
  typeRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  typeName: { fontSize: 12, color: C.text },
  typeCount: { fontSize: 12, fontWeight: '700' },
  typeBar: { height: 4, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  typeBarFill: { height: '100%', borderRadius: 3 },
  empty: { alignItems: 'center', paddingTop: 32 },
  emptyIcon: { fontSize: 30, marginBottom: 10 },
  emptyText: { fontSize: 12, color: C.muted },
});
