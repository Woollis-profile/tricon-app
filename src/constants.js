export const KEYS = {
  sessions: 'tricon_sessions',
  lastWeights: 'tricon_last_weights',
  unit: 'tricon_unit',
  weekIdx: 'tricon_week_idx',
  pushupMax: 'tricon_pushup_max',
  kbWeight: 'tricon_kb_weight',
};

export const C = {
  bg: '#0a0c0f',
  surface: '#111318',
  card: '#161b22',
  border: '#1e2530',
  accent: '#c8a96e',
  dim: '#8a6f3e',
  red: '#e05252',
  green: '#4caf7d',
  blue: '#4a90d9',
  orange: '#e8883a',
  purple: '#9b6fd4',
  muted: '#6b7280',
  text: '#e8e2d6',
  sub: '#9ca3af',
};

export const WORKOUT_DEFS = {
  upper: {
    id: 'upper', name: 'Upper Body', label: 'UPPER BODY', dayName: 'Monday', dayIndex: 1, calIndex: 0,
    color: C.accent, method: 'TRICON 3·3·3', duration: '60 min', useTricon: true,
    exercises: [
      { id: 'chest_press', name: 'Chest Press', muscle: 'Chest', equipment: 'Machine/DB', injury: 'Reduce ROM if shoulder discomfort' },
      { id: 'seated_row', name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', injury: null },
      { id: 'shoulder_press', name: 'Shoulder Press', muscle: 'Shoulders', equipment: 'Machine', injury: 'Use machine — reduces shoulder load' },
      { id: 'lat_pulldown', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', injury: null },
      { id: 'bicep_curl', name: 'Bicep Curl', muscle: 'Biceps', equipment: 'Cable/DB', injury: null },
      { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', injury: null },
    ],
  },
  lower: {
    id: 'lower', name: 'Lower Body', label: 'LOWER BODY', dayName: 'Wednesday', dayIndex: 3, calIndex: 2,
    color: C.blue, method: 'TRICON 3·3·3', duration: '60 min', useTricon: true,
    exercises: [
      { id: 'leg_press', name: 'Leg Press', muscle: 'Quads/Glutes', equipment: 'Machine', injury: 'Avoid full lockout if knee issues' },
      { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Dumbbells', injury: 'Monitor achilles — light calf load' },
      { id: 'leg_curl', name: 'Leg Curl', muscle: 'Hamstrings', equipment: 'Machine', injury: null },
      { id: 'leg_extension', name: 'Leg Extension', muscle: 'Quads', equipment: 'Machine', injury: 'Reduce ROM if knee discomfort' },
      { id: 'calf_raise', name: 'Standing Calf Raise', muscle: 'Calves', equipment: 'Machine', injury: 'Reduce range if lower leg injury' },
      { id: 'plank', name: 'Plank Hold', muscle: 'Core', equipment: 'Bodyweight', injury: null },
    ],
  },
  circuit: {
    id: 'circuit', name: 'Kettlebell Flow', label: 'KETTLEBELL FLOW', dayName: 'Friday',
    color: C.green, method: "Trevor's Instinct · 3 Rounds For Time", duration: '~20–30 min',
    useTricon: false, isForTime: true, rounds: 3, equipment: 'One Kettlebell',
    sourceVideo: 'https://www.youtube.com/shorts/LP17xxZ1iRs',
    exercises: [
      { id: 'helicopter_ccw', name: 'Helicopters (CCW)', muscle: 'Shoulders / Rotator Cuff / Core', equipment: 'Kettlebell', injury: 'Keep core braced — avoid if acute shoulder impingement', reps: 10, note: 'Wide arc overhead counter-clockwise · hips drive the rotation · stay tall' },
      { id: 'helicopter_cw', name: 'Helicopters (CW)', muscle: 'Shoulders / Rotator Cuff / Core', equipment: 'Kettlebell', injury: 'Keep core braced — avoid if acute shoulder impingement', reps: 10, note: 'Reverse direction · equal reps each side · control the descent' },
      { id: 'halo_ccw', name: 'Halos (CCW)', muscle: 'Shoulders / Upper Back / Core', equipment: 'Kettlebell', injury: 'Reduce weight if neck or shoulder tension present', reps: 10, note: 'Hold by horns · circle around head CCW · keep elbows in · slow orbit' },
      { id: 'halo_cw', name: 'Halos (CW)', muscle: 'Shoulders / Upper Back / Core', equipment: 'Kettlebell', injury: 'Reduce weight if neck or shoulder tension present', reps: 10, note: 'Reverse direction · shoulders packed down throughout' },
      { id: 'pullover', name: 'Pullovers', muscle: 'Lats / Chest / Core', equipment: 'Kettlebell', injury: 'Do not hyperextend lower back — brace throughout', reps: 10, note: 'Lie on back · hold by horns · lower behind head · pull back over chest · ribs down' },
    ],
  },
  amrap: {
    id: 'amrap', name: 'KB Benchmark', label: 'KB BENCHMARK', dayName: 'Friday',
    color: C.purple, method: "Trevor's Instinct · AMRAP 30 min", duration: '30 min',
    useTricon: false, isAMRAP: true, amrapMinutes: 30, equipment: 'One Kettlebell',
    sourceVideo: 'https://www.youtube.com/shorts/LP17xxZ1iRs',
    exercises: [
      { id: 'amrap_swing', name: 'KB Swings', muscle: 'Posterior Chain / Hips', equipment: 'Kettlebell', injury: 'Hip hinge — not a squat. Protect lower back.', reps: 10, note: 'Hike bell back · explosive hip snap · bell to shoulder height · absorb on the way down' },
      { id: 'amrap_press_l', name: 'Shoulder Press (Left)', muscle: 'Shoulder / Tricep / Core', equipment: 'Kettlebell', injury: 'Avoid if shoulder pain present', reps: 5, note: 'Clean to rack · press overhead · lock elbow · lower under control · brace core' },
      { id: 'amrap_press_r', name: 'Shoulder Press (Right)', muscle: 'Shoulder / Tricep / Core', equipment: 'Kettlebell', injury: 'Avoid if shoulder pain present', reps: 5, note: 'Same as left · equal reps each side · packed shoulder · press tall' },
      { id: 'amrap_squat_r', name: 'Single-Arm Squat (Right)', muscle: 'Quads / Glutes / Core', equipment: 'Kettlebell', injury: 'Reduce depth if knee discomfort', reps: 5, note: 'Bell in rack · sit between heels · chest tall · drive through heel · knee over toe' },
      { id: 'amrap_squat_l', name: 'Single-Arm Squat (Left)', muscle: 'Quads / Glutes / Core', equipment: 'Kettlebell', injury: 'Reduce depth if knee discomfort', reps: 5, note: 'Same as right · equal depth both sides · bell locks stability through the squat' },
      { id: 'amrap_pushup', name: 'Push-Ups (½ Max)', muscle: 'Chest / Triceps / Core', equipment: 'Bodyweight', injury: null, reps: null, note: 'Strict form · chest to floor · full lockout · stop at half max — never grind to failure in AMRAP' },
    ],
  },
};

export const FRIDAY_WORKOUTS = ['amrap', 'circuit'];
export const SCHEDULE = { 0: 'upper', 2: 'lower', 4: 'friday' };

export const ALL_EX = [
  ...WORKOUT_DEFS.upper.exercises.map(e => ({ ...e, cat: 'upper' })),
  ...WORKOUT_DEFS.lower.exercises.map(e => ({ ...e, cat: 'lower' })),
  ...WORKOUT_DEFS.circuit.exercises.map(e => ({ ...e, cat: 'circuit' })),
  ...WORKOUT_DEFS.amrap.exercises.map(e => ({ ...e, cat: 'amrap' })),
];

export const CAT_COLOR = { upper: C.accent, lower: C.blue, circuit: C.green, amrap: C.purple };
export const CAT_LABEL = { upper: 'UPPER BODY', lower: 'LOWER BODY', circuit: 'KETTLEBELL FLOW', amrap: 'KB BENCHMARK' };

export const PROG = [
  { week: 1, label: 'Foundation', sets: 3, intensity: '60% max', hold: 5, deload: false },
  { week: 2, label: 'Build', sets: 3, intensity: '65% max', hold: 5, deload: false },
  { week: 3, label: 'Strength', sets: 3, intensity: '70% max', hold: 5, deload: false },
  { week: 4, label: 'Peak', sets: 3, intensity: '75% max', hold: 5, deload: false },
  { week: 5, label: 'Deload', sets: 2, intensity: '50% max', hold: 5, deload: true },
  { week: 6, label: 'Build+', sets: 4, intensity: '65% max', hold: 10, deload: false },
];

export const TRICON_PHASES = (hold = 5) => [
  { repRange: '1 TO 3 REPS', name: 'EXPLOSIVE REPS', color: C.orange, bg: 'rgba(232,136,58,0.1)', steps: [{ time: 'EXP↑', desc: 'Drive up as fast as possible — maximum intent, full control' }, { time: '3s↓', desc: '3 second controlled eccentric descent' }], why: 'Recruits fast-twitch motor units. Fires the nervous system without joint stress.' },
  { repRange: '3 TO 6 REPS', name: 'ISOMETRIC HOLDS', color: C.accent, bg: 'rgba(200,169,110,0.1)', steps: [{ time: '3s↓', desc: '3 second controlled eccentric descent' }, { time: `${hold}s⏸`, desc: `${hold}s isometric hold at bottom — squeeze hard, no bounce${hold === 10 ? ' (advanced)' : ''}` }], why: 'Builds tendon strength and joint stability. Critical for older athletes' injury prevention.' },
  { repRange: '6 TO 9 REPS', name: 'FULL RANGE OF MOTION', color: C.green, bg: 'rgba(76,175,125,0.1)', steps: [{ time: '3s↓', desc: '3 second controlled eccentric descent' }, { time: '3s↑', desc: '3 second controlled concentric lift — full range of motion' }], why: 'Maximises time under tension for hypertrophy through complete ROM.' },
];

export const REST_TOTAL = 90;
export const BEEP_AT_REMAINING = 30;
export const DN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const AMRAP_TOTAL = 30 * 60;

export function getWeekStart(offsetWeeks = 0) {
  const n = new Date(), d = n.getDay(), mon = new Date(n);
  mon.setDate(n.getDate() - (d === 0 ? 6 : d - 1) + offsetWeeks * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export function weekLabel(offsetWeeks = 0) {
  const s = getWeekStart(offsetWeeks), e = new Date(s);
  e.setDate(s.getDate() + 6);
  const f = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${f(s)} – ${f(e)}`;
}

export function getWeekDates() {
  const mon = getWeekStart(0);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon); x.setDate(mon.getDate() + i); return x;
  });
}

export function fmt(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

export function getList(type) {
  return WORKOUT_DEFS[type]?.exercises || [];
}

export function buildExHistory(sessions) {
  const map = {};
  sessions.forEach(sess => {
    const list = getList(sess.type); if (!sess.exData) return;
    sess.exData.forEach((ex, i) => {
      const exId = list[i]?.id; if (!exId || !ex.weight) return;
      if (!map[exId]) map[exId] = [];
      map[exId].push({ date: sess.date, weight: parseFloat(ex.weight), sets: ex.sets?.length || 3 });
    });
  });
  return map;
}

export function weekWeightFromHistory(history, exId, offsetWeeks = 0) {
  const entries = history[exId]; if (!entries?.length) return null;
  const start = getWeekStart(offsetWeeks), end = new Date(start);
  end.setDate(start.getDate() + 7);
  const inWeek = entries.filter(e => new Date(e.date) >= start && new Date(e.date) < end);
  if (!inWeek.length) return null;
  return Math.max(...inWeek.map(e => e.weight));
}

export function weekChangeFromHistory(history, exId) {
  const tw = weekWeightFromHistory(history, exId, 0), lw = weekWeightFromHistory(history, exId, -1);
  if (tw === null || lw === null || lw === 0) return null;
  return ((tw - lw) / lw) * 100;
}
