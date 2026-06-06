# TRICON App — Autonomous Build Agent Instructions

## Role
You are the autonomous build agent for the TRICON workout app.
You execute build plans precisely, commit after each major step,
and never break existing functionality.

## Current Stack
- React Native + Expo SDK 54
- Supabase (auth + database): https://vjzqpkokdqfewlqwrmqi.supabase.co
- GitHub: Woollis-profile/tricon-app
- Vercel: tricon-app.vercel.app (landing page only)
- EAS Update: auto-deploys to production channel on every push to main

## Rules
- Never touch `TRICON-workout-app/` or `tricon-app-updated (1).jsx`
- Never touch `web/` folder (landing page — separate concern)
- All app work happens in `src/`, `lib/`, `App.js` only
- Always read the file before editing it
- Always commit after each completed step with a descriptive message
- Never break auth — AuthGate in App.js must remain intact
- Keep SecureStore as offline fallback — never remove it
- Handle all Supabase errors gracefully — never let a network
  failure crash the app

## Phase 3 — Supabase Cloud Sync (EXECUTE NOW)

### Step 1 — Create database tables
Use the Supabase MCP to run this SQL on the tricon project:

```sql
-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  unit text NOT NULL DEFAULT 'kg',
  week_idx integer NOT NULL DEFAULT 0,
  pushup_max integer NOT NULL DEFAULT 20,
  kb_weight text NOT NULL DEFAULT '',
  last_weights jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  type text NOT NULL,
  date timestamptz NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  volume numeric NOT NULL DEFAULT 0,
  amrap_rounds integer DEFAULT 0,
  round_times jsonb DEFAULT '[]',
  ex_data jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for sessions
CREATE POLICY "users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create settings row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Commit: 'Feature: Phase 3 Step 1 — Supabase schema and RLS policies'

### Step 2 — Create service layer
Create `src/supabaseService.js`:

```javascript
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
    return data || [];
  } catch { return null; }
}

export async function saveSession(userId, session) {
  try {
    const { error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        type: session.type,
        date: session.date,
        duration: session.duration || 0,
        volume: session.volume || 0,
        amrap_rounds: session.amrapRounds || 0,
        round_times: session.roundTimes || [],
        ex_data: session.exData || [],
      });
    if (error) console.warn('Session save failed:', error.message);
  } catch (e) { console.warn('Session save error:', e); }
}
```

Commit: 'Feature: Phase 3 Step 2 — Supabase service layer'

### Step 3 — Update context.js
Read `src/context.js` in full first, then update it to:

1. Import `loadUserSettings`, `saveUserSettings`, 
   `loadSessions`, `saveSession` from `./supabaseService`
2. Import `supabase` from `../lib/supabase`
3. On mount in `AppProvider`:
   - Get current user: `const { data: { user } } = 
     await supabase.auth.getUser()`
   - Store userId in state
   - Try `loadSessions(user.id)` — if returns data use it,
     else fall back to SecureStore
   - Try `loadUserSettings(user.id)` — if returns data use it,
     else fall back to SecureStore
   - After loading from Supabase sync back to SecureStore
4. In `handleComplete` (session saved):
   - Call `saveSession(userId, session)` and existing 
     SecureStore save simultaneously with `Promise.all`
5. Add a `useEffect` watching unit, weekIdx, pushupMax, 
   kbWeight, lastWeights:
   - Debounce 2000ms
   - Call `saveUserSettings(userId, { unit, week_idx: weekIdx,
     pushup_max: pushupMax, kb_weight: kbWeight, 
     last_weights: lastWeights })`
   - Also save to SecureStore as before
6. Keep all existing SecureStore logic completely intact

Commit: 'Feature: Phase 3 Step 3 — context.js Supabase sync'

### Step 4 — Verify
After all steps check:
- No TypeScript/JS syntax errors
- AuthGate still wraps the app in App.js
- SecureStore imports still present in context.js
- supabaseService.js has all 4 exported functions

Commit: 'Feature: Phase 3 complete — cloud sync live'

## After Phase 3
Wait for further instructions before starting Phase 4.
