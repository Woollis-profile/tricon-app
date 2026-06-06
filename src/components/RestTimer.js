import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, REST_TOTAL, BEEP_AT_REMAINING } from '../constants';
import { beepAt30, beepTick, beepDone } from '../audio';

const { height: SCREEN_H } = Dimensions.get('window');
const R = 52, cx = 62, cy = 62, circ = 2 * Math.PI * R;

export default function RestTimer({ exName, setIdx, onDone, onSkip }) {
  const [rem, setRem] = useState(REST_TOTAL);
  const fired = useRef({ mid: false });

  useEffect(() => {
    const iv = setInterval(() => {
      setRem(r => {
        const next = r - 1;
        if (next === BEEP_AT_REMAINING && !fired.current.mid) { fired.current.mid = true; beepAt30(); }
        if (next <= 5 && next > 0) beepTick();
        if (next <= 0) { clearInterval(iv); beepDone(); setTimeout(onDone, 400); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const isCD = rem <= 5;
  const offset = (circ * (1 - rem / REST_TOTAL)).toFixed(1);

  return (
    <View style={s.overlay}>
      <View style={s.handle} />
      <Text style={s.label}>REST · SET {setIdx + 1} COMPLETE</Text>
      <Text style={s.exName}>{exName}</Text>
      <View style={s.svgWrap}>
        <Svg width={124} height={124} viewBox="0 0 124 124">
          <Circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={6} />
          <Circle cx={cx} cy={cy} r={R} fill="none"
            stroke={isCD ? C.red : C.accent} strokeWidth={6}
            strokeDasharray={circ.toFixed(1)} strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        </Svg>
        <View style={s.timeOverlay}>
          <Text style={[s.timeNum, isCD && { color: C.red }]}>{rem}</Text>
          <Text style={s.timeLbl}>SECONDS</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onSkip} style={s.skipBtn}>
        <Text style={s.skipText}>SKIP REST →</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_H * 0.5,
    backgroundColor: '#0d1117',
    borderTopWidth: 2, borderTopColor: C.border,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    zIndex: 200,
    alignItems: 'center',
    paddingTop: 16, paddingHorizontal: 22, paddingBottom: 20,
  },
  handle: { width: 38, height: 4, backgroundColor: '#2a3040', borderRadius: 2, marginBottom: 12 },
  label: { fontSize: 10, color: C.muted, letterSpacing: 2, flexShrink: 0 },
  exName: { fontSize: 12, color: C.accent, marginTop: 4, marginBottom: 10, flexShrink: 0, textAlign: 'center' },
  svgWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  timeOverlay: { position: 'absolute', alignItems: 'center', overflow: 'visible' },
  timeNum: { fontFamily: 'Oswald_700Bold', fontSize: 42, color: C.text, lineHeight: 55 },
  timeLbl: { fontSize: 10, color: C.muted, letterSpacing: 1, marginTop: 1 },
  skipBtn: {
    width: '100%', marginTop: 14,
    backgroundColor: 'rgba(138,111,62,0.18)',
    borderWidth: 1, borderColor: 'rgba(138,111,62,0.38)',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  skipText: { fontFamily: 'Oswald_700Bold', fontSize: 13, color: C.accent, letterSpacing: 1 },
});
