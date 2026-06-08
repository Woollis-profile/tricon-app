import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { KEYS } from './constants';
import { load, save } from './storage';
import { supabase } from '../lib/supabase';
import {
  loadUserSettings,
  saveUserSettings,
  loadSessions,
  saveSession,
} from './supabaseService';
import { initPurchases, getIsUnlocked } from './lib/purchases';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isReady, setIsReady]       = useState(false);
  const [userId, setUserId]         = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessions, setSessions]     = useState([]);
  const [lastWeights, setLastWeights] = useState({});
  const [unit, setUnit]             = useState('kg');
  const [weekIdx, setWeekIdx]       = useState(0);
  const [pushupMax, setPushupMax]   = useState(20);
  const [kbWeight, setKbWeight]     = useState('');

  // Keep a ref to sessions so addSession never reads stale closure state
  const sessionsRef = useRef([]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  // Debounce timer for Supabase settings sync
  const settingsTimer = useRef(null);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      // Resolve current auth user
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);

      // Configure RevenueCat and check unlock status
      if (uid) await initPurchases(uid);
      setIsUnlocked(await getIsUnlocked());

      if (uid) {
        // Try Supabase first, fall back to SecureStore on failure
        const [remoteSettings, remoteSessions] = await Promise.all([
          loadUserSettings(uid),
          loadSessions(uid),
        ]);

        if (remoteSettings) {
          const rs = remoteSettings;
          const u   = rs.unit        ?? 'kg';
          const wi  = rs.week_idx    ?? 0;
          const pm  = rs.pushup_max  ?? 20;
          const kb  = rs.kb_weight   ?? '';
          const lw  = rs.last_weights ?? {};
          setUnit(u); setWeekIdx(wi); setPushupMax(pm); setKbWeight(kb); setLastWeights(lw);
          // Sync back to SecureStore as local cache
          await Promise.all([
            save(KEYS.unit, u),
            save(KEYS.weekIdx, wi),
            save(KEYS.pushupMax, pm),
            save(KEYS.kbWeight, kb),
            save(KEYS.lastWeights, lw),
          ]);
        } else {
          // SecureStore fallback for settings
          const [u, wi, pm, kb, lw] = await Promise.all([
            load(KEYS.unit, 'kg'),
            load(KEYS.weekIdx, 0),
            load(KEYS.pushupMax, 20),
            load(KEYS.kbWeight, ''),
            load(KEYS.lastWeights, {}),
          ]);
          setUnit(u); setWeekIdx(wi); setPushupMax(pm); setKbWeight(kb); setLastWeights(lw);
        }

        if (remoteSessions) {
          setSessions(remoteSessions);
          await save(KEYS.sessions, remoteSessions);
        } else {
          // SecureStore fallback for sessions
          const s = await load(KEYS.sessions, []);
          setSessions(s);
        }
      } else {
        // Not signed in — load everything from SecureStore
        const [s, lw, u, wi, pm, kb] = await Promise.all([
          load(KEYS.sessions, []),
          load(KEYS.lastWeights, {}),
          load(KEYS.unit, 'kg'),
          load(KEYS.weekIdx, 0),
          load(KEYS.pushupMax, 20),
          load(KEYS.kbWeight, ''),
        ]);
        setSessions(s); setLastWeights(lw); setUnit(u);
        setWeekIdx(wi); setPushupMax(pm); setKbWeight(kb);
      }

      setIsReady(true);
    })();
  }, []);

  // ── SecureStore persistence (offline fallback) ────────────────────────────
  useEffect(() => { if (isReady) save(KEYS.sessions,     sessions);    }, [sessions,     isReady]);
  useEffect(() => { if (isReady) save(KEYS.lastWeights,  lastWeights); }, [lastWeights,  isReady]);
  useEffect(() => { if (isReady) save(KEYS.unit,         unit);        }, [unit,         isReady]);
  useEffect(() => { if (isReady) save(KEYS.weekIdx,      weekIdx);     }, [weekIdx,      isReady]);
  useEffect(() => { if (isReady) save(KEYS.pushupMax,    pushupMax);   }, [pushupMax,    isReady]);
  useEffect(() => { if (isReady) save(KEYS.kbWeight,     kbWeight);    }, [kbWeight,     isReady]);

  // ── Debounced Supabase settings sync (2 s after last change) ─────────────
  useEffect(() => {
    if (!isReady || !userId) return;
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    settingsTimer.current = setTimeout(() => {
      saveUserSettings(userId, {
        unit,
        week_idx:    weekIdx,
        pushup_max:  pushupMax,
        kb_weight:   kbWeight,
        last_weights: lastWeights,
      });
    }, 2000);
    return () => { if (settingsTimer.current) clearTimeout(settingsTimer.current); };
  }, [unit, weekIdx, pushupMax, kbWeight, lastWeights, isReady, userId]);

  // ── Add session: saves to Supabase + SecureStore simultaneously ───────────
  const addSession = async (session) => {
    const newSessions = [...sessionsRef.current, session];
    setSessions(newSessions);
    await Promise.all([
      save(KEYS.sessions, newSessions),
      userId ? saveSession(userId, session) : Promise.resolve(null),
    ]);
  };

  return (
    <AppContext.Provider value={{
      isReady,
      isUnlocked, setIsUnlocked,
      sessions, setSessions, addSession,
      lastWeights, setLastWeights,
      unit, setUnit,
      weekIdx, setWeekIdx,
      pushupMax, setPushupMax,
      kbWeight, setKbWeight,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
