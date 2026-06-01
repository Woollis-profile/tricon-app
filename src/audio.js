import { Vibration } from 'react-native';

// Vibration-based equivalents of the Web Audio API beep functions.
// Patterns: [delay, vibrate, pause, vibrate, ...]
export const beepAt30 = () => Vibration.vibrate(120);
export const beepTick = () => Vibration.vibrate([0, 60, 60, 60]);
export const beepDone = () => Vibration.vibrate([0, 100, 80, 120, 80, 200]);
export const beepRound = () => Vibration.vibrate([0, 80, 70, 80, 70, 80, 70, 160]);
