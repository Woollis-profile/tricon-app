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
- EAS Update: OTA auto-deploys to `production` channel on every push to main

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

## Current Status — What Is Actually Built and Live

### Auth (COMPLETE)
- Supabase email/password auth
- `AuthGate` in App.js wraps the entire app — checks
  `supabase.auth.getSession()` on mount, listens to
  `onAuthStateChange`. Shows `AuthScreen` if no session,
  renders children if session exists.
- AuthScreen has gym-background + dark overlay + TRICON
  logo/wordmark branding

### Supabase Cloud Sync (COMPLETE — Phase 3)
Verified live against project `vjzqpkokdqfewlqwrmqi`:

**Database tables (both exist, RLS enabled):**
- `public.user_settings` — 2 rows, PK: user_id (FK → auth.users)
  Columns: unit, week_idx, pushup_max, kb_weight, last_weights, updated_at
- `public.sessions` — 0 rows currently, PK: id (UUID)
  Columns: user_id, type, date, duration, volume, amrap_rounds,
  round_times (jsonb), ex_data (jsonb), created_at
- Row-level security policies: SELECT/INSERT/UPDATE for own rows
- `handle_new_user()` trigger: auto-creates user_settings row on signup

**Service layer (`src/supabaseService.js` — 4 exports):**
- `loadUserSettings(userId)` — SELECT with .single()
- `saveUserSettings(userId, settings)` — upsert with updated_at
- `loadSessions(userId)` — SELECT ordered by date desc,
  maps snake_case columns → camelCase (amrap_rounds → amrapRounds etc.)
- `saveSession(userId, session)` — INSERT with all fields mapped

**context.js sync logic (all wired):**
- On mount: resolves auth user → parallel Supabase load
  (settings + sessions) → falls back to SecureStore if either fails
  → syncs Supabase data back to SecureStore as local cache
- SecureStore persistence: individual useEffect per field for offline
  fallback (sessions, lastWeights, unit, weekIdx, pushupMax, kbWeight)
- Debounced settings sync: 2000ms after any change to unit/weekIdx/
  pushupMax/kbWeight/lastWeights → calls `saveUserSettings`
- `addSession`: writes to both Supabase + SecureStore simultaneously
  via `Promise.all`

### Paywall (COMPLETE — Phase 5)
- RevenueCat SDK (`react-native-purchases`) installed and wired
- `src/lib/purchases.js` exports: `initPurchases`, `getIsUnlocked`,
  `purchaseUnlock`, `restorePurchases`
- Entitlement name: `'pro'`
- Graceful fallback in Expo Go (SDK not available → `false` returned)
- Gating in App.js: `GatedStats` component wraps StatsScreen —
  shows lock UI with UNLOCK NOW button when `!isUnlocked`
- Save-to-unlock logic lives inside WorkoutScreen
- Restore purchase available in SettingsScreen
- ⚠️  IMPORTANT: Currently using TEST API key:
  `appl_test_INBnRpnMvclGSNNpEpVZnwlDuXo`
  Must be replaced with production key before App Store submission

### OTA Update Pipeline (COMPLETE — Phase 6)
- `eas.json` configured: development / preview / production channels
- `appVersionSource: remote` — version managed by EAS, not app.json
- OTA check on cold start AND on AppState → 'active' (foreground resume)
  in App.js — silently fails, never blocks the user
- Every push to main auto-deploys via EAS Update to production channel
- Runtime version: `1.0.0`

### Branded UI — Home Screen (COMPLETE)
- `assets/gym-bg.jpg` as ImageBackground
- Dark overlay: `rgba(0,0,0,0.65)`
- △ TRICON hero (white triangle, gold TRICON) in `src/components/HomeHero.js`
- Fixed viewport (no scroll): flex-start layout with fixed spacers
  - `height: 100` top spacer → hero center at ~25% screen height
  - `height: 44` gap between hero and week strip
  - `flex: 1` fill spacer pushes tagline to bottom edge
- Content flow: TRICON hero → week strip → CTA card → stat tiles →
  LET'S TRAIN! (marginTop: 48 from tiles) → TRAINING METHOD tagline
  (pinned to bottom edge)

### Library Screen — Video Links (COMPLETE)
**METHOD tab:**
- KB Benchmark card: Watch KB Benchmark button
- KB Flow card: Watch KB Flow button

**EXERCISES tab:**
- Upper exercises: per-exercise YouTube search link (all)
  - Chest Press: direct link (youtu.be/Eaa2vo2XXAU)
  - All others: `youtube.com/results?search_query=...`
- Lower exercises: per-exercise search links + category banner
  below list (TRICON Leg Exercises → youtu.be/Eu8dDi0QyJA)
- Flow (circuit) exercises: NO per-exercise links
  + category banner below list (KETTLEBELL FLOW · @trevorsinstinct
  → youtube.com/shorts/LP17xxZ1iRs)
- AMRAP exercises: NO per-exercise links
  + category banner below list (KB BENCHMARK · @trevorsinstinct
  → youtube.com/shorts/yDLVERq6hCc)
- Category banners use `filtered.some(ex => ex.cat === '...')` so
  they appear on both the specific filter AND the All filter

---

## Remaining Work Before App Store Submission

### 1. RevenueCat Production API Key (BLOCKER)
`src/lib/purchases.js` line 10 has a test key:
```
apiKey: 'appl_test_INBnRpnMvclGSNNpEpVZnwlDuXo'
```
Replace with the production iOS key from RevenueCat dashboard
before submitting to App Store. Test key will not process real
purchases.

### 2. App Store Connect Listing
- App name, subtitle, description, keywords
- Privacy policy URL
- Support URL
- Category selection
- Age rating questionnaire
- Screenshots (6.7" iPhone, 6.1" iPhone — required)
- App Preview video (optional)

### 3. App Store Submission
```
eas submit --platform ios
```
Requires App Store Connect API key configured in EAS.

### 4. App Store Review
Standard Apple review process (1–3 days).
Ensure in-app purchase product is approved in App Store Connect
before submitting the binary.

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
`mcp__claude_ai_Supabase__execute_sql` to run SQL and
`mcp__claude_ai_Supabase__list_tables` to inspect schema.
Project ID: `vjzqpkokdqfewlqwrmqi`.
Always use `mcp__claude_ai_Supabase__apply_migration` (not
`execute_sql`) for DDL operations (CREATE TABLE, ALTER, etc.).

## After Remaining Work
Wait for further instructions before starting any new phase.