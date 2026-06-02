import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Generate a minimal base64-encoded WAV data URI for a pure sine tone.
// React Native 0.71+ Hermes has btoa; expo-av resolves data URIs natively.
function toneSrc(freq, durationMs, vol = 0.28) {
  const sr = 22050;
  const n = Math.floor(sr * durationMs / 1000);
  const pcm = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const env = i < n * 0.1 ? i / (n * 0.1) : i > n * 0.8 ? (n - i) / (n * 0.2) : 1;
    pcm[i] = Math.round(Math.sin((2 * Math.PI * freq * i) / sr) * vol * 32767 * env);
  }
  const h = new ArrayBuffer(44);
  const v = new DataView(h);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE');
  ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, n * 2, true);
  const out = new Uint8Array(44 + n * 2);
  out.set(new Uint8Array(h));
  out.set(new Uint8Array(pcm.buffer), 44);
  let str = '';
  for (let i = 0; i < out.length; i++) str += String.fromCharCode(out[i]);
  return 'data:audio/wav;base64,' + btoa(str);
}

async function playTone(freq, durationMs, vol = 0.28) {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: toneSrc(freq, durationMs, vol) });
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync().catch(() => {}), durationMs + 300);
  } catch (_) { /* audio not critical — haptics still fire */ }
}

// 30-second warning: single mid-tone beep
export const beepAt30 = () => {
  playTone(900, 180, 0.34);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Last-5-second countdown ticks: two quick high beeps
export const beepTick = () => {
  playTone(1300, 70, 0.38);
  setTimeout(() => playTone(1300, 70, 0.28), 110);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

// Completion: ascending 3-tone fanfare
export const beepDone = () => {
  playTone(660, 130);
  setTimeout(() => playTone(880, 130), 170);
  setTimeout(() => playTone(1100, 220), 340);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Round complete: ascending 4-tone fanfare
export const beepRound = () => {
  playTone(440, 100);
  setTimeout(() => playTone(550, 100), 130);
  setTimeout(() => playTone(660, 100), 260);
  setTimeout(() => playTone(880, 280), 390);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
