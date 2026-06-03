import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Dimensions, Modal, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { C, WORKOUT_DEFS, PROG, getList, fmt, AMRAP_TOTAL } from '../constants';
import { useAppContext } from '../context';
import { beepDone } from '../audio';
import TopBar from '../components/TopBar';
import RestTimer from '../components/RestTimer';
import AmrapTracker from '../components/AmrapTracker';
import FlowRoundTracker from '../components/FlowRoundTracker';
import ExCard from '../components/ExCard';

const { height: SCREEN_H } = Dimensions.get('window');

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params;
  const { weekIdx, unit, pushupMax, kbWeight, setKbWeight, lastWeights, setSessions, setLastWeights } = useAppContext();

  const prog = { ...PROG[weekIdx], useTricon: WORKOUT_DEFS[type]?.useTricon || false };
  const wkDef = WORKOUT_DEFS[type];
  const list = wkDef.exercises;
  const isFlow = type === 'circuit';
  const isAMRAP = type === 'amrap';

  const [phase, setPhase] = useState('warmup');
  const [elapsed, setElapsed] = useState(0);
  const [openEx, setOpenEx] = useState(null);
  const [exData, setExData] = useState(() =>
    list.map(ex => ({
      weight: lastWeights[ex.id] || '',
      sets: Array.from({ length: prog.sets }, () => ({ reps: '9', done: false })),
    }))
  );
  const [rest, setRest] = useState(null);
  const [roundTimes, setRoundTimes] = useState([]);
  const [amrapRounds, setAmrapRounds] = useState(0);
  const [amrapPartial, setAmrapPartial] = useState(null);
  const [showAmrapModal, setShowAmrapModal] = useState(false);
  const [finalChecked, setFinalChecked] = useState(() => Array(list.length).fill(false));
  const [finalPushupReps, setFinalPushupReps] = useState(() => String(Math.max(1, Math.floor((pushupMax || 10) / 2))));
  const elRef = useRef(null);
  const currentRound = roundTimes.length;
  const halfPushups = Math.max(1, Math.floor((pushupMax || 10) / 2));

  useEffect(() => {
    if (phase !== 'active') return;
    elRef.current = setInterval(() => setElapsed(e => {
      const next = e + 1;
      if (isAMRAP && next >= AMRAP_TOTAL) {
        clearInterval(elRef.current);
        beepDone();
      }
      return next;
    }), 1000);
    return () => clearInterval(elRef.current);
  }, [phase, isAMRAP]);

  const handleWeightChange = (ei, val) =>
    setExData(prev => prev.map((ex, i) => i !== ei ? ex : {
      ...ex,
      weight: val,
      sets: ex.sets.map(s => s.done ? s : { ...s }),
    }));

  const handleRepsChange = (ei, si, val) =>
    setExData(prev => prev.map((ex, i) => i !== ei ? ex : { ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, reps: val }) }));

  const handleDone = (ei, si) => {
    setExData(prev => {
      const updated = prev.map((ex, i) => i !== ei ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => j !== si ? s : { ...s, done: true, weight: ex.weight }),
      });
      if (updated[ei].sets.every(s => s.done)) {
        const next = ei + 1;
        if (next < list.length) setTimeout(() => setOpenEx(next), 100);
      }
      return updated;
    });
    const allSetsDoneAfter = exData[ei].sets.filter(s => s.done).length + 1 >= exData[ei].sets.length;
    if (!allSetsDoneAfter) setRest({ exIdx: ei, setIdx: si });
  };

  const handleCompleteFlowRound = (time) => {
    const newRounds = [...roundTimes, time];
    setRoundTimes(newRounds);
    if (newRounds.length >= wkDef.rounds) setTimeout(() => setPhase('done'), 600);
  };

  const handleAmrapRoundComplete = () => setAmrapRounds(r => r + 1);
  const handleAmrapPartial = (data) => setAmrapPartial(data);

  const handleSavePartial = () => {
    const pushupReps = parseInt(finalPushupReps) || 0;
    handleAmrapPartial({
      partial: true,
      exercises: list.map((ex, i) => {
        const isPushup = ex.id === 'amrap_pushup';
        return {
          id: ex.id, name: ex.name,
          completed: isPushup ? pushupReps > 0 : finalChecked[i],
          reps: isPushup ? pushupReps : (finalChecked[i] ? ex.reps : 0),
        };
      }),
    });
    setShowAmrapModal(false);
    setPhase('done');
  };

  const handleSkipPartial = () => {
    setShowAmrapModal(false);
    setPhase('done');
  };

  const totalVol = exData.reduce((acc, ex) =>
    acc + ex.sets.reduce((a, s) => a + (parseFloat(ex.weight) || 0) * (parseInt(s.reps) || 0), 0), 0);

  const onComplete = () => {
    const newW = { ...lastWeights };
    list.forEach((ex, i) => { if (exData[i]?.weight) newW[ex.id] = exData[i].weight; });
    setLastWeights(newW);
    setSessions(prev => [...prev, {
      type, date: new Date().toISOString(), duration: elapsed,
      volume: isAMRAP ? amrapRounds : isFlow ? roundTimes.length : totalVol,
      exData, roundTimes, amrapRounds, amrapPartial,
    }]);
    navigation.navigate('Main');
  };

  const warmupItems = isAMRAP
    ? ['10× light KB swings — groove the hip hinge', '5× each arm shoulder circles with KB', '10× bodyweight squats — slow and controlled', '5× push-up to downward dog']
    : isFlow
      ? ['KB halos ×10 — 2 min', 'Shoulder circles & neck rolls — 1 min', 'Light KB helicopters ×5 each side — 2 min']
      : type === 'upper'
        ? ['Arm circles & shoulder rolls — 2 min', 'Band pull-aparts & external rotations — 3 min', 'Treadmill incline walk — 3 min']
        : ['Hip circles & leg swings — 2 min', 'Bodyweight squats ×15 — 2 min', 'Elliptical / bike — 4 min'];

  const coolDownText = type === 'upper'
    ? '• Chest, shoulders, triceps, lats — 30s each\n• Box breathing — 2 min'
    : type === 'lower'
      ? '• Quads, hamstrings, glutes, calves — 30s each\n• Foam roll IT band, quads, calves'
      : '• Chest opener, lat stretch, shoulder cross-body — 30s each\n• Neck rolls · wrist circles\n• Box breathing — 2 min';

  // ── DONE ──
  if (phase === 'done') return (
    <View style={s.screen}>
      <TopBar title="Session Complete" onBack={() => navigation.navigate('Main')} />
      <ScrollView contentContainerStyle={s.doneContent}>
        <Text style={[s.doneIcon, { color: isAMRAP ? C.purple : C.green }]}>{isAMRAP ? '⏱' : '✓'}</Text>
        <Text style={s.doneTitle}>{isAMRAP ? 'AMRAP\nCOMPLETE' : 'SESSION\nCOMPLETE'}</Text>
        <Text style={s.doneMeta}>{wkDef.name} · {fmt(elapsed)}</Text>
        {isAMRAP && (
          <View style={[s.amrapResult, { backgroundColor: C.purple + '12', borderColor: C.purple + '30' }]}>
            <Text style={[s.amrapResultNum, { color: C.purple }]}>
              {amrapRounds}{amrapPartial ? <Text style={s.amrapPartialSuffix}> + partial</Text> : null}
            </Text>
            <Text style={s.amrapResultLbl}>{amrapPartial ? `${amrapRounds} FULL ROUNDS + 1 PARTIAL` : 'ROUNDS IN 30 MINUTES'}</Text>
            <Text style={s.amrapResultDetail}>{kbWeight} {unit} · {halfPushups} push-ups per round (½ of {pushupMax})</Text>
          </View>
        )}
        {isFlow && roundTimes.length > 0 && (
          <View style={s.splitsCard}>
            <Text style={s.splitsLabel}>ROUND SPLITS</Text>
            <View style={s.splitsRow}>
              {roundTimes.map((t, i) => (
                <View key={i} style={s.splitItem}>
                  <Text style={s.splitTime}>{fmt(t)}</Text>
                  <Text style={s.splitRound}>ROUND {i + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={s.summaryCard}>
          <View style={s.summaryGrid}>
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: isAMRAP ? C.purple : C.green }]}>{fmt(elapsed)}</Text>
              <Text style={s.summaryLbl}>DURATION</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={[s.summaryNum, { color: C.blue }]}>
                {isAMRAP ? amrapRounds : isFlow ? `${roundTimes.length}/${wkDef.rounds}` : Math.round(totalVol)}
              </Text>
              <Text style={s.summaryLbl}>{isAMRAP ? 'ROUNDS' : isFlow ? 'ROUNDS' : 'TOTAL ' + unit.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onComplete}
          style={[s.saveBtn, { backgroundColor: isAMRAP ? C.purple : C.green }]}>
          <Text style={s.saveBtnText}>SAVE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ── WARMUP ──
  if (phase === 'warmup') return (
    <View style={s.screen}>
      <TopBar title={`${wkDef.name} — Warm Up`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.warmupContent}>
        <View style={s.warmupCard}>
          <View style={[s.warmupCardHeader, { backgroundColor: isAMRAP ? C.purple + '18' : 'rgba(76,175,125,0.1)' }]}>
            <Text style={[s.warmupCardTitle, { color: isAMRAP ? C.purple : C.green }]}>🔥 WARM-UP — 5 MINUTES</Text>
          </View>
          {warmupItems.map((w, i) => (
            <View key={i} style={[s.warmupItem, i < warmupItems.length - 1 && s.warmupItemBorder]}>
              <View style={[s.warmupNum, { backgroundColor: isAMRAP ? C.purple + '25' : 'rgba(76,175,125,0.18)' }]}>
                <Text style={[s.warmupNumText, { color: isAMRAP ? C.purple : C.green }]}>{i + 1}</Text>
              </View>
              <Text style={s.warmupItemText}>{w}</Text>
            </View>
          ))}
        </View>

        {isAMRAP && (
          <>
            <View style={[s.setupCard, { borderColor: C.purple + '30' }]}>
              <View style={[s.setupHeader, { backgroundColor: C.purple + '12' }]}>
                <Text style={[s.setupHeaderText, { color: C.purple }]}>SESSION SETUP</Text>
              </View>
              <View style={s.setupRow}>
                <View>
                  <Text style={s.setupLabel}>KB WEIGHT</Text>
                  <Text style={s.setupVal}>{kbWeight || '—'} <Text style={s.setupUnit}>{unit}</Text></Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.setupLabel}>PUSH-UPS / ROUND</Text>
                  <Text style={[s.setupVal, { color: C.purple }]}>{halfPushups} <Text style={s.setupUnit}>reps (½ of {pushupMax})</Text></Text>
                </View>
              </View>
              <Text style={s.setupNote}>Update KB weight and push-up max in Settings ⚙</Text>
            </View>
            <View style={[s.roundPreviewCard, { borderColor: C.purple + '30' }]}>
              <View style={[s.roundPreviewHeader, { backgroundColor: C.purple + '12' }]}>
                <Text style={[s.roundPreviewTitle, { color: C.purple }]}>ONE ROUND</Text>
                <Text style={s.roundPreviewSub}>Trevor's Instinct</Text>
              </View>
              {list.map((ex, i) => {
                const reps = ex.id === 'amrap_pushup' ? halfPushups : ex.reps;
                return (
                  <View key={ex.id} style={[s.roundExRow, i < list.length - 1 && s.roundExRowBorder]}>
                    <View style={[s.roundExBadge, { backgroundColor: C.purple + '20' }]}>
                      <Text style={[s.roundExBadgeText, { color: C.purple }]}>{i + 1}</Text>
                    </View>
                    <View style={s.roundExInfo}>
                      <Text style={s.roundExName}>{ex.name}</Text>
                      <Text style={s.roundExNote}>{ex.note}</Text>
                    </View>
                    <Text style={[s.roundExReps, { color: C.purple }]}>×{reps}</Text>
                  </View>
                );
              })}
              <View style={[s.roundClock, { backgroundColor: C.purple + '08' }]}>
                <Text style={s.roundClockLabel}>Clock runs for</Text>
                <Text style={[s.roundClockTime, { color: C.purple }]}>30:00</Text>
              </View>
            </View>
            <View style={[s.howToCard, { backgroundColor: C.purple + '08', borderColor: C.purple + '20' }]}>
              <Text style={[s.howToTitle, { color: C.purple }]}>HOW TO TRACK</Text>
              <Text style={s.howToText}>{'· Tap each exercise to check it off\n· Hit ROUND DONE to increment your counter\n· Rest as needed — clock keeps running\n· Try to beat your round count every Friday'}</Text>
            </View>
          </>
        )}

        {isFlow && (
          <View style={[s.flowCard, { borderColor: C.green + '30' }]}>
            <View style={s.flowCardHeader}>
              <Text style={[s.flowCardTitle, { color: C.green }]}>EACH ROUND — 5 MOVEMENTS</Text>
            </View>
            {list.map((ex, i) => (
              <View key={ex.id} style={[s.flowExRow, i < list.length - 1 && s.flowExRowBorder]}>
                <View style={s.flowExBadge}>
                  <Text style={[s.flowExBadgeText, { color: C.green }]}>{i + 1}</Text>
                </View>
                <View style={s.flowExInfo}>
                  <Text style={s.flowExName}>{ex.name}</Text>
                  <Text style={s.flowExNote}>{ex.note}</Text>
                </View>
                <Text style={[s.flowExReps, { color: C.green }]}>×{ex.reps}</Text>
              </View>
            ))}
          </View>
        )}

        {(isAMRAP || isFlow) && (
          <TouchableOpacity onPress={() => Linking.openURL(wkDef.sourceVideo)} style={s.ytLink}>
            <Text style={s.ytLinkIcon}>▶</Text>
            <View>
              <Text style={s.ytLinkTitle}>Watch on YouTube</Text>
              <Text style={s.ytLinkSub}>@trevorsinstinct · {wkDef.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
      <View style={s.warmupFooter}>
        <TouchableOpacity onPress={() => setPhase('active')}
          style={[s.startBtn, { backgroundColor: wkDef.color }]}>
          <Text style={[s.startBtnText, { color: isAMRAP ? '#fff' : '#0a0c0f' }]}>
            {isAMRAP ? 'START CLOCK — 30:00 →' : 'START CLOCK →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── ACTIVE ──
  return (
    <View style={s.screen}>
      <TopBar
        title={isAMRAP ? `${fmt(AMRAP_TOTAL - elapsed)} LEFT` : fmt(elapsed)}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => isAMRAP ? setShowAmrapModal(true) : setPhase('done')}
            style={[s.finishBtn, { backgroundColor: isAMRAP ? C.purple + '20' : 'rgba(76,175,125,0.15)', borderColor: isAMRAP ? C.purple + '40' : 'rgba(76,175,125,0.3)' }]}>
            <Text style={[s.finishBtnText, { color: isAMRAP ? C.purple : C.green }]}>FINISH</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={s.activeScroll}
        contentContainerStyle={[s.activeContent, { paddingBottom: rest ? SCREEN_H * 0.52 : 100 }]}
      >
        <View style={s.activeBanner}>
          <Text style={s.activeBannerLeft}>
            {isAMRAP ? 'AMRAP 30 MIN' : isFlow ? '3 Rounds For Time' : `Wk ${PROG[weekIdx].week} · ${PROG[weekIdx].label}`}
          </Text>
          <Text style={[s.activeBannerRight, { color: wkDef.color }]}>{wkDef.label}</Text>
        </View>

        {isAMRAP ? (
          <AmrapTracker
            exercises={list} elapsed={elapsed}
            pushupMax={pushupMax || 10} kbWeight={kbWeight}
            unit={unit} onRoundComplete={handleAmrapRoundComplete}
            onKbWeightChange={(v) => setKbWeight(v)}
            roundCount={amrapRounds}
          />
        ) : isFlow ? (
          <FlowRoundTracker
            exercises={list} roundTimes={roundTimes}
            currentRound={currentRound}
            onCompleteRound={handleCompleteFlowRound}
            elapsed={elapsed}
            kbWeight={kbWeight} unit={unit}
            onKbWeightChange={(v) => setKbWeight(v)}
          />
        ) : (
          list.map((ex, ei) => (
            <ExCard key={ex.id} ex={ex} exData={exData[ei]} exIdx={ei}
              isOpen={openEx === ei}
              onToggle={() => setOpenEx(openEx === ei ? null : ei)}
              onDone={si => handleDone(ei, si)}
              onWeightChange={val => handleWeightChange(ei, val)}
              onRepsChange={(si, val) => handleRepsChange(ei, si, val)}
              prog={prog} unit={unit} wkType={type}
            />
          ))
        )}

        <View style={s.coolDown}>
          <Text style={s.coolDownTitle}>❄ COOL-DOWN — 5 MIN</Text>
          <Text style={s.coolDownText}>{coolDownText}</Text>
        </View>
      </ScrollView>
      {rest && (
        <RestTimer
          exName={list[rest.exIdx].name}
          setIdx={rest.setIdx}
          onDone={() => setRest(null)}
          onSkip={() => setRest(null)}
        />
      )}
      {isAMRAP && (
        <Modal visible={showAmrapModal} transparent animationType="fade" onRequestClose={() => setShowAmrapModal(false)}>
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>LOG FINAL ROUND?</Text>
              <Text style={s.modalSub}>Tick what you completed before time ran out</Text>
              {list.map((ex, i) => {
                const isPushup = ex.id === 'amrap_pushup';
                const checked = finalChecked[i];
                const reps = isPushup ? halfPushups : ex.reps;
                if (isPushup) {
                  return (
                    <View key={ex.id} style={[s.modalExRow, s.modalExRowLast]}>
                      <View style={s.modalExInfo}>
                        <Text style={s.modalExName}>{ex.name}</Text>
                        <View style={s.modalPushupRow}>
                          <Text style={s.modalPushupLabel}>Reps: </Text>
                          <TextInput
                            keyboardType="number-pad"
                            value={finalPushupReps}
                            onChangeText={setFinalPushupReps}
                            style={s.modalPushupInput}
                            maxLength={3}
                          />
                          <Text style={s.modalPushupLabel}> (½ max = {halfPushups})</Text>
                        </View>
                      </View>
                    </View>
                  );
                }
                return (
                  <TouchableOpacity key={ex.id}
                    onPress={() => setFinalChecked(prev => prev.map((v, idx) => idx === i ? !v : v))}
                    style={[s.modalExRow, checked && s.modalExRowChecked, i < list.length - 1 && s.modalExRowBorder]}>
                    <View style={[s.modalCheckbox, checked && s.modalCheckboxChecked]}>
                      {checked && <Text style={s.modalCheckMark}>✓</Text>}
                    </View>
                    <View style={s.modalExInfo}>
                      <Text style={[s.modalExName, checked && s.modalExNameDone]}>{ex.name}</Text>
                      <Text style={s.modalExDetail}>×{reps} · {ex.muscle}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={s.modalActions}>
                <TouchableOpacity onPress={handleSavePartial} style={[s.modalBtn, s.modalBtnSave]}>
                  <Text style={s.modalBtnSaveText}>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSkipPartial} style={[s.modalBtn, s.modalBtnSkip]}>
                  <Text style={s.modalBtnSkipText}>SKIP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  // DONE
  doneContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: 100 },
  doneIcon: { fontSize: 54, lineHeight: 54 },
  doneTitle: { fontFamily: 'Oswald_700Bold', fontSize: 25, color: C.text, marginTop: 12, textAlign: 'center', letterSpacing: 0.5 },
  doneMeta: { color: C.muted, fontSize: 12, marginTop: 7 },
  amrapResult: { borderWidth: 1, borderRadius: 12, padding: 20, marginTop: 16, width: '100%', alignItems: 'center' },
  amrapResultNum: { fontFamily: 'Oswald_700Bold', fontSize: 54, lineHeight: 54 },
  amrapResultLbl: { fontSize: 11, color: C.muted, letterSpacing: 1, marginTop: 4 },
  amrapResultDetail: { fontSize: 10, color: C.sub, marginTop: 8, lineHeight: 16, textAlign: 'center' },
  splitsCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginTop: 14, width: '100%' },
  splitsLabel: { fontSize: 10, color: C.green, letterSpacing: 1, marginBottom: 8 },
  splitsRow: { flexDirection: 'row', gap: 8 },
  splitItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(76,175,125,0.08)', borderWidth: 1, borderColor: 'rgba(76,175,125,0.2)', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 4 },
  splitTime: { fontFamily: 'Oswald_700Bold', fontSize: 19, color: C.green },
  splitRound: { fontSize: 8, color: C.muted, marginTop: 2 },
  summaryCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, marginTop: 12, width: '100%' },
  summaryGrid: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontFamily: 'Oswald_700Bold', fontSize: 22 },
  summaryLbl: { fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: 1 },
  saveBtn: { width: '100%', marginTop: 18, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 15, color: '#fff', letterSpacing: 1 },
  // WARMUP
  warmupContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 100, gap: 10 },
  warmupCard: { backgroundColor: C.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  warmupCardHeader: { paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  warmupCardTitle: { fontSize: 12, letterSpacing: 1 },
  warmupItem: { paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  warmupItemBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  warmupNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  warmupNumText: { fontSize: 10, fontWeight: '700' },
  warmupItemText: { fontSize: 12, color: C.text, flex: 1 },
  setupCard: { backgroundColor: C.card, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  setupHeader: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  setupHeaderText: { fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  setupRow: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border },
  setupLabel: { fontSize: 10, color: C.muted, marginBottom: 3 },
  setupVal: { fontFamily: 'Oswald_700Bold', fontSize: 24, color: C.text },
  setupUnit: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: C.muted },
  setupNote: { paddingVertical: 10, paddingHorizontal: 14, fontSize: 10, color: C.muted },
  roundPreviewCard: { backgroundColor: '#0d1117', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  roundPreviewHeader: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roundPreviewTitle: { fontSize: 12, letterSpacing: 1, fontWeight: '700' },
  roundPreviewSub: { fontSize: 9, color: C.muted },
  roundExRow: { paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  roundExRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  roundExBadge: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  roundExBadgeText: { fontSize: 10, fontWeight: '700', fontFamily: 'Oswald_700Bold' },
  roundExInfo: { flex: 1 },
  roundExName: { fontSize: 12, color: C.text, fontWeight: '600' },
  roundExNote: { fontSize: 10, color: C.muted, marginTop: 1 },
  roundExReps: { fontFamily: 'Oswald_700Bold', fontSize: 16 },
  roundClock: { paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between' },
  roundClockLabel: { fontSize: 10, color: C.muted },
  roundClockTime: { fontFamily: 'Oswald_700Bold', fontSize: 16 },
  howToCard: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14 },
  howToTitle: { fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  howToText: { fontSize: 11, color: C.sub, lineHeight: 20 },
  flowCard: { backgroundColor: '#0d1117', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  flowCardHeader: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: 'rgba(76,175,125,0.1)', borderBottomWidth: 1, borderBottomColor: C.border },
  flowCardTitle: { fontSize: 12, fontWeight: '700' },
  flowExRow: { paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  flowExRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  flowExBadge: { width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(76,175,125,0.15)', alignItems: 'center', justifyContent: 'center' },
  flowExBadgeText: { fontSize: 10, fontWeight: '700' },
  flowExInfo: { flex: 1 },
  flowExName: { fontSize: 12, color: C.text, fontWeight: '600' },
  flowExNote: { fontSize: 10, color: C.muted, marginTop: 1 },
  flowExReps: { fontFamily: 'Oswald_700Bold', fontSize: 16 },
  ytLink: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,0,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14 },
  ytLinkIcon: { fontSize: 20, color: '#ff6b6b' },
  ytLinkTitle: { fontSize: 12, color: '#ff6b6b', fontWeight: '700' },
  ytLinkSub: { fontSize: 10, color: C.muted, marginTop: 2 },
  warmupFooter: { paddingHorizontal: 14, paddingBottom: 20, paddingTop: 10 },
  startBtn: { borderRadius: 10, padding: 13, alignItems: 'center' },
  startBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 15, letterSpacing: 1 },
  // ACTIVE
  finishBtn: { borderRadius: 6, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1 },
  finishBtnText: { fontSize: 12, fontWeight: '700', fontFamily: 'Oswald_700Bold' },
  activeScroll: { flex: 1 },
  activeContent: { paddingTop: 8 },
  activeBanner: { marginHorizontal: 14, marginBottom: 10, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 7, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeBannerLeft: { fontSize: 10, color: C.muted },
  activeBannerRight: { fontSize: 10, fontWeight: '700', fontFamily: 'Oswald_700Bold' },
  coolDown: { marginHorizontal: 14, marginBottom: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.blue + '33', borderRadius: 12, padding: 14 },
  coolDownTitle: { fontSize: 11, color: C.blue, letterSpacing: 1, marginBottom: 5 },
  coolDownText: { fontSize: 11, color: C.sub, lineHeight: 19 },
  amrapPartialSuffix: { fontFamily: 'Oswald_400Regular', fontSize: 28, color: C.purple + 'aa' },
  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.purple + '40', width: '100%', overflow: 'hidden' },
  modalTitle: { fontFamily: 'Oswald_700Bold', fontSize: 18, color: C.purple, letterSpacing: 1, paddingTop: 18, paddingHorizontal: 16, paddingBottom: 4 },
  modalSub: { fontSize: 11, color: C.muted, paddingHorizontal: 16, paddingBottom: 10 },
  modalExRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 16, gap: 12 },
  modalExRowChecked: { backgroundColor: C.purple + '10' },
  modalExRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  modalExRowLast: { borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface },
  modalCheckbox: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#0d1117', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  modalCheckboxChecked: { backgroundColor: C.purple + '30', borderColor: C.purple },
  modalCheckMark: { fontSize: 13, color: C.purple },
  modalExInfo: { flex: 1 },
  modalExName: { fontSize: 13, color: C.text, fontWeight: '600' },
  modalExNameDone: { color: C.purple, textDecorationLine: 'line-through' },
  modalExDetail: { fontSize: 10, color: C.muted, marginTop: 1 },
  modalPushupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  modalPushupLabel: { fontSize: 10, color: C.muted },
  modalPushupInput: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.purple + '60', borderRadius: 6, color: C.text, paddingVertical: 4, paddingHorizontal: 10, fontSize: 15, fontFamily: 'Oswald_700Bold', textAlign: 'center', minWidth: 48 },
  modalActions: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: C.border },
  modalBtn: { flex: 1, borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1 },
  modalBtnSave: { backgroundColor: C.purple, borderColor: C.purple + '80' },
  modalBtnSaveText: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: '#fff', letterSpacing: 1 },
  modalBtnSkip: { backgroundColor: C.card, borderColor: C.border },
  modalBtnSkipText: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: C.muted, letterSpacing: 1 },
});
