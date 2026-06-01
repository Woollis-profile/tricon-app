import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vjzqpkokdqfewlqwrmqi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqenFwa29rZHFmZXdscXdybXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODgzMjAsImV4cCI6MjA5NTg2NDMyMH0.Wnzq-LmzXz_sb9IP5YUY6aGM1D2sbc6qQ5H5xgziY3k';

// SecureStore on iOS has a 2048-byte limit per item. Session JWTs can exceed
// this, so we chunk large values across multiple keys.
const CHUNK_SIZE = 1800;

const SecureStoreAdapter = {
  async getItem(key) {
    const n = await SecureStore.getItemAsync(`${key}__n`);
    if (n === null) return SecureStore.getItemAsync(key);
    const chunks = await Promise.all(
      Array.from({ length: parseInt(n, 10) }, (_, i) =>
        SecureStore.getItemAsync(`${key}__${i}`)
      )
    );
    return chunks.join('');
  },

  async setItem(key, value) {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.deleteItemAsync(`${key}__n`);
      return SecureStore.setItemAsync(key, value);
    }
    const chunks = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}__n`, String(chunks.length));
    await Promise.all(
      chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}__${i}`, chunk))
    );
  },

  async removeItem(key) {
    const n = await SecureStore.getItemAsync(`${key}__n`);
    if (n !== null) {
      await Promise.all(
        Array.from({ length: parseInt(n, 10) }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}__${i}`)
        )
      );
      await SecureStore.deleteItemAsync(`${key}__n`);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
