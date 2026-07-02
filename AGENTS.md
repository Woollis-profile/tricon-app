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
  Exception: vercel.json routing fixes are OK
- All app work happens in `src/`, `lib/`, `App.js` only
- Always read the file before editing it
- Always commit after each completed step with a descriptive message
- Never break auth — AuthGate in App.js must remain intact
- Keep SecureStore as offline fallback — never remove it
- Handle all Supabase errors gracefully — never let a network
  failure crash the app
- **NEVER commit App.js with SCREENSHOT_MODE=true** — it bypasses
  auth for all production users

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
- `public.user_settings` — PK: user_id (FK → auth.users)
  Columns: unit, week_idx, pushup_max, kb_weight, last_weights, updated_at
- `public.sessions` — PK: id (UUID)
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
- Init IIFE has `.catch(() => setIsReady(true))` fallback so a
  SecureStore/Supabase crash never freezes the splash screen

### Paywall (COMPLETE — Phase 5)
- RevenueCat SDK (`react-native-purchases`) installed and wired
- `src/lib/purchases.js` exports: `initPurchases`, `getIsUnlocked`,
  `purchaseUnlock`, `restorePurchases`
- Entitlement name: `'pro'`
- Production API key in use: `appl_UpscCSrGfMiWBJmWHnjnbMGxMnb`
- Graceful fallback in Expo Go (SDK not available → `false` returned)
- Gating in App.js: `GatedStats` component wraps StatsScreen —
  shows lock UI with UNLOCK NOW button when `!isUnlocked`
- Save-to-unlock logic lives inside WorkoutScreen
- Restore purchase available in SettingsScreen
- ⚠️  KNOWN ISSUE: `offerings.current` may be null if no offering
  is configured as "Current" in the RevenueCat dashboard. This causes
  `purchaseUnlock()` to throw silently. Verify dashboard before testing.

### OTA Update Pipeline (COMPLETE — Phase 6)
- `eas.json` configured: development / preview / production channels
- `appVersionSource: remote` — version managed by EAS, not app.json
- `build.production.ios.autoIncrement: true` — build number increments
  automatically on each new production build
- OTA check on cold start AND on AppState → 'active' (foreground resume)
  in App.js — silently fails, never blocks the user
- Every push to main auto-deploys via EAS Update to production channel
- Runtime version: `1.0.0`

### App Store Submission (IN PROGRESS)
- Build 2 submitted to Apple (build ID: d9a7789a)
- App Store Connect App ID: **6780101094**
- Bundle ID: `com.grantharvey.tricontraining`
- EAS project: `acb0370f-661a-46db-b2cd-5c32ddac9d08`
- ascAppId set in eas.json: `6780101094`

### Privacy Policy (LIVE)
- `web/privacy.html` — styled TRICON-branded page
- Live at: **https://tricon-app.vercel.app/privacy**
- Use this URL in App Store Connect → App Information → Privacy Policy

### App Store Review Demo Account (CREATED)
- Email: `applereview@tricontraining.app`
- Password: `TriConReview2026!`
- Auto-confirmed (no email click needed), user_settings row exists
- Use these credentials in App Store Connect → App Review Information

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
- Web-only: ImageBackground has `height: '100vh'` + `backgroundColor: C.bg`
  + `imageStyle={{ backgroundPosition: '50% 35%' }}` via Platform.OS check

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

### 1. ⚠️  BLOCKER — RevenueCat Offering Not Verified
`purchases.js` → `purchaseUnlock()` calls `getOfferings()` and reads
`offerings.current?.availablePackages[0]`. If `offerings.current` is
null (no offering set as "Current" in RevenueCat dashboard), it throws
silently and the UNLOCK button does nothing.

**Check:** RevenueCat dashboard → TriCon app → Offerings → confirm a
default offering is set as "Current" with the $14.99 non-consumable
product attached.

**Debug build is live:** `purchases.js` has `[RC]` console.log output
and `WorkoutScreen.js` has `Alert.alert('RC Debug', e.message)` in the
catch block. Tap UNLOCK on device to see the exact error in an alert.
Remove these before final resubmission.

### 2. App Store Screenshots
- Required: 6.7" iPhone (1290×2796 px)
- Method: `expo start --web` + Chrome DevTools 430×932 @3x DPR
- `react-dom` and `react-native-web` are installed
- See Lesson 16 for the full screenshot workflow
- SCREENSHOT_MODE flag exists in App.js for bypassing auth locally

### 3. App Store Connect Listing — Remaining Items
- App description, keywords, subtitle
- Support URL
- Category, age rating questionnaire
- Upload screenshots
- Enter demo account credentials in App Review Information
- Privacy Policy URL: `https://tricon-app.vercel.app/privacy` ✅ live

### 4. App Store Review
- Binary (build 2) is submitted and awaiting Apple processing
- Once listing is complete, submit for review from App Store Connect
- Standard review: 1–3 days
- Ensure IAP product is approved in App Store Connect first

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

Note: JSON files (eas.json, vercel.json) do NOT have this issue —
the Edit tool works fine on them.

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

### 11. EAS Submit — ascAppId Required for Non-Interactive
`eas submit --non-interactive` fails immediately if `ascAppId`
is not set in eas.json. Add it under `submit.production.ios`:

```json
"submit": {
  "production": {
    "ios": { "ascAppId": "6780101094" }
  }
}
```

App Store Connect App ID for this project: **6780101094**
(Not 6782521559 — that was the wrong ID tried first.)

### 12. EAS Submit — Apple Rejects Duplicate Build Numbers
Apple rejects a binary upload if the same build number was
previously uploaded for that app, even if the previous upload
failed. Fix by adding `autoIncrement` to eas.json:

```json
"build": {
  "production": {
    "channel": "production",
    "ios": { "autoIncrement": true }
  }
}
```

This auto-increments the build number on each EAS build.

### 13. EAS Submit Verbose Flag Doesn't Surface Apple Errors
`eas submit --verbose` only adds local CLI debug output. The
actual Apple rejection reason is processed on EAS servers and
only visible on the EAS submission dashboard:
`https://expo.dev/accounts/gharvz/projects/tricon/submissions/<id>`

If the CLI ends with "Something went wrong when submitting your
app to Apple App Store Connect." — open that URL for the real error.

### 14. RevenueCat Debugging Without a Dev Client
On Windows with no Mac, you can surface RC errors directly in the
app UI via `Alert.alert`. Add to the catch block in
`handleUnlockAndSave` in WorkoutScreen.js:

```js
} catch (e) {
  console.error('[Paywall] purchaseUnlock threw:', e.message, e);
  Alert.alert('RC Debug', e.message || String(e));
}
```

Push as OTA update. Tap UNLOCK on device — the exact RC error
appears in a native alert on screen.

**Most likely RC failure mode:** `offerings.current` is null when
no offering is configured as "Current" in the RevenueCat dashboard.
Error: `[RC] No package available — offerings.current is null or empty`

**Always check:** empty `catch (e) {}` blocks silently swallow all
RevenueCat (and other) errors. Always log in catch blocks.

### 15. Creating Auto-Confirmed Supabase Demo Users via SQL
Use a CTE to insert user + identity in one transaction:

```sql
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'email@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  ) RETURNING id
)
INSERT INTO auth.identities (id, user_id, provider_id,
  identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), id, 'email@example.com',
  jsonb_build_object('sub', id::text, 'email', 'email@example.com'),
  'email', now(), now(), now()
FROM new_user;
```

Key: `email_confirmed_at: now()` = auto-confirmed, no email click.
Key: the `email` column in `auth.identities` is GENERATED — do NOT
include it in the INSERT column list or it will error.
The `handle_new_user()` trigger auto-creates the `user_settings` row.

### 16. App Store Screenshots on Windows (No Mac)
Required size: 1290×2796 px (6.7" iPhone, covers all iPhone slots).

**Setup (one-time):**
```
npx expo install react-dom react-native-web
```

**Workflow:**
1. Add `const SCREENSHOT_MODE = true;` to App.js (see Lesson 17)
2. Run: `$env:CI="1"; npx expo start --web --port 8081`
3. Open Chrome → `http://localhost:8081`
4. DevTools (F12) → Ctrl+Shift+M → Add custom device:
   Name: iPhone 15 Pro Max, Width: 430, Height: 932, DPR: 3
5. Navigate to each screen
6. DevTools device toolbar → ⋮ → "Capture screenshot" → 1290×2796 PNG

**Screens that need SCREENSHOT_MODE:**
- Home, Plan, Library, Settings render cleanly with no state
- Stats needs SCREENSHOT_MODE (bypasses `isUnlocked` gate)
- Workout screen needs route params to render a workout

**Cleanup:** Revert App.js before committing. Never push
SCREENSHOT_MODE=true to origin.

### 17. SCREENSHOT_MODE Pattern — Auth Bypass for Screenshots
Three changes to App.js, local only, never committed to origin:

```js
// After imports:
const SCREENSHOT_MODE = true; // ← flip false when done

// In AuthGate:
function AuthGate({ children }) {
  if (SCREENSHOT_MODE) return children;
  // ...rest of auth logic

// In GatedStats:
if (!isUnlocked && !SCREENSHOT_MODE) {
```

Also add `.catch(() => setIsReady(true))` to the init IIFE in
`src/context.js` so SecureStore crashes on web don't freeze
the splash screen:
```js
})().catch(() => setIsReady(true));
```

And add `backgroundColor: C.bg` to `SafeAreaProvider` in App.js
to prevent grey browser chrome showing below nav tabs on web.

### 18. ImageBackground on Web Needs Explicit Height
`flex: 1` alone on `ImageBackground` doesn't fill the full viewport
height on web — the navigation stack above doesn't provide an explicit
pixel height like native does.

Fix in HomeScreen.js (web-only, doesn't affect native iOS):
```jsx
import { Platform } from 'react-native';

<ImageBackground
  source={require('../../assets/gym-bg.jpg')}
  style={[
    { flex: 1 },
    Platform.OS === 'web' && { height: '100vh', backgroundColor: C.bg }
  ]}
  imageStyle={Platform.OS === 'web'
    ? { backgroundPosition: '50% 35%' }
    : undefined}
  resizeMode="cover"
>
```

`height: '100vh'` gives the flex chain an explicit height so the
`flex: 1` fill spacer works and the bottom tagline anchors correctly.
`backgroundPosition: '50% 35%'` shifts the image upward to show
the equipment area (adjust percentage to taste).

### 19. Vercel Routing — Explicit .html Routes Required
The catch-all route `"src": "/(.*)", "dest": "/web/$1"` does NOT
automatically serve `.html` files — `/privacy` maps to `/web/privacy`
(no extension), which 404s.

Add explicit routes before the catch-all for each HTML page:
```json
"routes": [
  { "src": "/assets/(.*)", "dest": "/web/assets/$1" },
  { "src": "/privacy", "dest": "/web/privacy.html" },
  { "src": "/(.*)", "dest": "/web/$1" }
]
```

Routes are matched in order — the explicit route wins before the
catch-all. This pattern applies to any new `.html` pages added to `web/`.

### 20. EAS Credentials is Interactive-Only
`eas credentials` cannot run non-interactively — it always prompts
for platform selection before showing any output. Must be run in a
real interactive terminal, not via the agent's background task system.

## After Remaining Work
Wait for further instructions before starting any new phase.
---

## Future Native iOS App

If TriCon is rebuilt as a native SwiftUI app (iPhone + Apple Watch), follow the
decisions in `references/apple-native-ios.md`. Key choices:

| Layer | Choice |
|---|---|
| UI | SwiftUI (all platforms — no UIKit/WatchKit storyboards) |
| Persistence | SwiftData + CloudKit sync (replace Supabase) |
| Workout data | `HKWorkoutBuilder` with `.traditionalStrengthTraining` / `.functionalStrengthTraining` |
| State | `@Observable` macro (Swift 5.9+) |
| Timer | `TimelineView` on iOS; `WKExtendedRuntimeSession` on Watch |
| IAP | StoreKit 2 (replaces RevenueCat) |
| Auth | Sign in with Apple (`AuthenticationServices`) |
| Secrets | Keychain — never `UserDefaults` |
| Audio beeps | `AudioServicesPlaySystemSound` |
| Notifications | `UserNotifications` — calendar trigger per workout day |

**Critical rules:**
- Always call HealthKit `requestAuthorization` on the **main thread**
- Never block UI on CloudKit — write local first, sync async
- Never link to external payment for digital goods (App Review 3.1.1)
- Include medical disclaimer in App Store description:
  `Not intended to diagnose, treat, cure, or prevent any disease`  
- Declare HealthKit in Privacy Nutrition Labels in App Store Connect
- `WKExtendedRuntimeSession` is required or watchOS suspends mid-workout
- Verify StoreKit 2 transactions with `verification.payloadValue` — never trust unverified payloads

See `SKILL.md` for the full app-builder-expert skill definition and`references/apple-native-ios.md` for complete Apple developer API reference.
