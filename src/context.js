import React, { createContext, useContext, useState, useEffect } from 'react';
import { KEYS } from './constants';
import { load, save } from './storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [lastWeights, setLastWeights] = useState({});
  const [unit, setUnit] = useState('kg');
  const [weekIdx, setWeekIdx] = useState(0);
  const [pushupMax, setPushupMax] = useState(20);
  const [kbWeight, setKbWeight] = useState('');

  useEffect(() => {
    (async () => {
      const [s, lw, u, wi, pm, kb] = await Promise.all([
        load(KEYS.sessions, []),
        load(KEYS.lastWeights, {}),
        load(KEYS.unit, 'kg'),
        load(KEYS.weekIdx, 0),
        load(KEYS.pushupMax, 20),
        load(KEYS.kbWeight, ''),
      ]);
      setSessions(s);
      setLastWeights(lw);
      setUnit(u);
      setWeekIdx(wi);
      setPushupMax(pm);
      setKbWeight(kb);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => { if (isReady) save(KEYS.sessions, sessions); }, [sessions, isReady]);
  useEffect(() => { if (isReady) save(KEYS.lastWeights, lastWeights); }, [lastWeights, isReady]);
  useEffect(() => { if (isReady) save(KEYS.unit, unit); }, [unit, isReady]);
  useEffect(() => { if (isReady) save(KEYS.weekIdx, weekIdx); }, [weekIdx, isReady]);
  useEffect(() => { if (isReady) save(KEYS.pushupMax, pushupMax); }, [pushupMax, isReady]);
  useEffect(() => { if (isReady) save(KEYS.kbWeight, kbWeight); }, [kbWeight, isReady]);

  return (
    <AppContext.Provider value={{
      isReady, sessions, setSessions,
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
