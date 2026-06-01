import * as SecureStore from 'expo-secure-store';

export async function load(key, fallback) {
  try {
    const v = await SecureStore.getItemAsync(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export async function save(key, val) {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(val));
  } catch {}
}
