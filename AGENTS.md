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

---

## Lessons Learned from Build Sessions

### 1. File Editing on Windows — CRLF is Mandatory
All source files use CRLF (`\r\n`) line endings on Windows.
**The Edit tool fails silently on CRLF files** — the old_string
will never match. Always use a Python script instead:

```python
with open(path, encoding='utf-8', newline='') as f:
    src = f.read()
src = src.replace(old, new)  # old must use \r\n explicitly
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(src)
```

For full file rewrites use the Write tool with a Python script
that builds the content string using `\r\n` throughout, then
writes it with `newline=''`.

Always verify the patch worked with `grep` before committing.
Clean up the .py script with `rm` after use.

### 2. JSX Tag Counting Before Committing
When restructuring JSX with multiple nested `<View>` components,
manually count opening vs closing tags before committing.
A single missing `</View>` will fail the EAS bundle silently
at the Metro stage — the commit succeeds but the OTA update
publishes a broken bundle. The error looks like:
`SyntaxError: Expected corresponding JSX closing tag for <View>`

### 3. EAS Update Workflow
- Always run `eas update` in background (`run_in_background: true`)
- Read the output file when the task-notification arrives
- Check for `✔ Published!` and capture the `Update group ID`
- If the output shows `✖ Export failed` — the bundle is broken,
  fix the JS error and push a new commit + update

### 4. Detect Duplicate Requests
Before acting on a task, check if it's already done in the file.
The user sometimes re-sends a previous request. Use `grep` or
`Read` on the relevant file first — if the change is already
present, report it as done with the prior update group ID.

### 5. Layout — Fixed Spacers Beat justifyContent: space-between
`justifyContent: 'space-between'` distributes ALL free space
equally between child groups, which means the gap above the hero
equals the gap below it. This pushes the hero too low.

For precise screen positioning use:
- Fixed `<View style={{ height: N }} />` spacers for known gaps
- `<View style={{ flex: 1 }} />` fill spacer to push content
  to the bottom edge
- Remove `justifyContent: 'space-between'` from the container

Example: hero at 25% mark, content tight below, tagline pinned
to bottom:
```jsx
<View style={{ flex: 1 }}>          {/* content container */}
  <View style={{ height: 100 }} />  {/* top spacer */}
  <HomeHero />
  <View style={{ height: 44 }} />   {/* hero-to-content gap */}
  <View>{ /* week strip, CTA, stats, LET'S TRAIN */ }</View>
  <View style={{ flex: 1 }} />      {/* fill spacer */}
  <Text style={s.bottomTagline} />  {/* pinned to bottom */}
</View>
```

### 6. HomeHero is a Separate Component
`src/components/HomeHero.js` — not inline in HomeScreen.
Edit it separately when changing the △ TRICON hero appearance.
HomeScreen.js imports it as `<HomeHero sessions={sessions} />`.

### 7. Per-Exercise YouTube URL Overrides
To give one specific exercise a direct video link while all
others keep a search-query URL, use a ternary on `ex.id`
inside the existing `!isKB` block in LibraryScreen.js:

```jsx
onPress={() => Linking.openURL(ex.id === 'chest_press'
  ? 'https://youtu.be/Eaa2vo2XXAU?si=vD0yx8sHTmC9rfY8'
  : `https://www.youtube.com/results?search_query=...`)}
```

### 8. Category-Level Video Banners in EXERCISES Tab
To add a banner below all exercises in a filtered category,
insert after the `{filtered.map(...)}` close and before
`</ScrollView>`, conditional on `filtered.some(...)`:

```jsx
{filtered.some(ex => ex.cat === 'lower') && (
  <TouchableOpacity
    onPress={() => Linking.openURL('...')}
    style={[s.ytBtn, { marginTop: 12, marginBottom: 4,
      alignSelf: 'stretch' }]}>
    <Text style={s.ytText}>▶</Text>
    <View>
      <Text style={s.ytText}>Watch on YouTube</Text>
      <Text style={[s.ytText, { fontSize: 9, fontWeight: '400',
        opacity: 0.7 }]}>Subtitle text</Text>
    </View>
  </TouchableOpacity>
)}
```

`filtered.some(ex => ex.cat === 'lower')` correctly fires on
both the explicit "Lower" filter AND the "All" filter, and hides
on all other category filters automatically.

### 9. isKB Gate for KB Exercises
In LibraryScreen.js the gate for KB exercises is:
```js
const isKB = ex.cat === 'circuit' || ex.cat === 'amrap';
```
`!isKB` guards the per-exercise YouTube search link and the
TRICON 9-rep sequence block. Both `circuit` and `amrap`
exercises skip these — they show KB-specific notes instead.

### 10. Supabase MCP Tool
The project has Supabase MCP available. Use
`mcp__claude_ai_Supabase__execute_sql` or
`mcp__claude_ai_Supabase__apply_migration` to run SQL directly
on the tricon project. Project ID: `vjzqpkokdqfewlqwrmqi`.

---

## Completed Work (by Phase)

### Phases 1–2 — Core App (complete)
Auth (Supabase email), workout engine (Upper/Lower/Friday AMRAP+Flow),
session logging, history, plan screen, library screen, settings.

### Phase 4 — Branded Auth Screen (complete)
- `assets/tricon-logo.png` + `assets/tricon-wordmark.png`
- `assets/gym-bg.jpg` as ImageBackground on HomeScreen
- AuthScreen with full-screen gym background + dark overlay

### Phase 5 — Paywall (complete)
- RevenueCat SDK wired (`$14.99/lifetime`)
- Free: workout view + library. Save-to-unlock paywall gate.
- Restore purchase in Settings screen.

### Phase 6 — EAS Build Config (complete)
- `eas.json` configured, iOS bundle ID set
- `appVersionSource: remote` in app.json
- OTA update check on foreground resume

### UI Polish (complete — no phase number)
- HomeScreen: gym background + dark overlay, △ TRICON hero
  (white triangle, gold TRICON), LET'S TRAIN! + tagline
- HomeScreen: fixed viewport (no scroll), flex-spacer layout
  with hero at ~25% mark, tagline pinned to bottom
- LibraryScreen METHODS tab: Watch KB Benchmark + Watch KB Flow
  video buttons on method cards
- LibraryScreen EXERCISES tab:
  - KB Flow (circuit) + AMRAP exercises: no per-exercise YouTube links
  - Chest Press: direct video link (not search query)
  - Category banners after exercise lists:
    - Lower Body → TRICON Leg Exercises
    - Flow → KETTLEBELL FLOW · @trevorsinstinct
    - AMRAP → KB BENCHMARK · @trevorsinstinct

---

## Phase 3 — Supabase Cloud Sync (NEXT — NOT YET STARTED)

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