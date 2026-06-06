import { supabase } from '../lib/supabase';

export async function loadUserSettings(userId) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function saveUserSettings(userId, settings) {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...settings,
        updated_at: new Date().toISOString() });
    if (error) console.warn('Settings save failed:', error.message);
  } catch (e) { console.warn('Settings save error:', e); }
}

export async function loadSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) return null;
    return (data || []).map(row => ({
      id:          row.id,
      type:        row.type,
      date:        row.date,
      duration:    row.duration,
      volume:      Number(row.volume),
      amrapRounds: row.amrap_rounds ?? 0,
      roundTimes:  row.round_times  ?? [],
      exData:      row.ex_data      ?? [],
    }));
  } catch { return null; }
}

export async function saveSession(userId, session) {
  try {
    const { error } = await supabase
      .from('sessions')
      .insert({
        user_id:      userId,
        type:         session.type,
        date:         session.date,
        duration:     session.duration    || 0,
        volume:       session.volume      || 0,
        amrap_rounds: session.amrapRounds || 0,
        round_times:  session.roundTimes  || [],
        ex_data:      session.exData      || [],
      });
    if (error) console.warn('Session save failed:', error.message);
  } catch (e) { console.warn('Session save error:', e); }
}
