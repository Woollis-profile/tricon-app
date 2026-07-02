# Apple Native iOS / watchOS Developer Reference
> Scraped from developer.apple.com — July 2026

---

## SwiftUI — UI Framework

**What it is:** Declarative UI framework for all Apple platforms. Define views with the `View` protocol; compose with stacks, lists, and modifiers.

**Key concepts:**
- `App` protocol — entry point; `Scene` — container for views
- `@State`, `@Binding`, `@StateObject`, `@ObservedObject`, `@EnvironmentObject` — state management
- `@Query` macro (SwiftData) — replaces `@FetchRequest` for modern persistence
- `modelContainer()` / `modelContext()` view modifiers — inject persistence context

**Workout app patterns:**
- `TabView` with `.tabViewStyle(.page)` for swipe-between-workout-screens
- `TimelineView` — clock-driven updates for live timers (no manual `Timer.publish`)
- `NavigationStack` + `.navigationDestination` — type-safe push navigation
- `.task {}` modifier — async on-appear work (cancels automatically on disappear)

**Animations relevant to fitness apps:**
- `withAnimation(.spring())` for rep counters, progress rings
- `Canvas {}` view for custom ring/arc drawing (replaces many `UIBezierPath` patterns)
- `MatchedGeometryEffect` for exercise-to-detail transitions

---

## HealthKit — Fitness Data

**What it is:** Central repository for health + fitness data. Requires user permission per data type.

**Setup checklist:**
1. Enable HealthKit capability in Xcode target
2. Add `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription` to `Info.plist`
3. Call `HKHealthStore().requestAuthorization(toShare:read:)` — always on main thread

**Workout recording (critical for TriCon app):**
```swift
// HKWorkoutBuilder — incremental construction
let config = HKWorkoutConfiguration()
config.activityType = .traditionalStrengthTraining
config.locationType = .indoor

let builder = HKWorkoutBuilder(healthStore: store, configuration: config, device: .local())
try await builder.beginCollection(at: .now)

// Add samples during the session
let energySample = HKQuantitySample(type: .init(.activeEnergyBurned), quantity: ..., start: ..., end: ...)
try await builder.addSamples([energySample])

// Finish
try await builder.endCollection(at: .now)
let workout = try await builder.finishWorkout()
```

**Key HKWorkoutActivityType values for strength/KB training:**
- `.traditionalStrengthTraining` — TriCon upper/lower days
- `.functionalStrengthTraining` — kettlebell flows and AMRAP
- `.highIntensityIntervalTraining` — if adding HIIT circuits

**Writing workout volume as metadata:**
```swift
let metadata: [String: Any] = [
    HKMetadataKeyWorkoutBrandName: "TriCon 3-3-3",
    "totalVolumeKg": 1240.0,
    "amrapRounds": 7
]
try await builder.addMetadata(metadata)
```

**Activity rings:** Saving `HKWorkout` samples automatically contributes to the user's Move ring. Set `totalEnergyBurned` accurately.

**Data types worth reading:**
- `HKQuantityTypeIdentifier.heartRate` — requires Apple Watch or Bluetooth HR monitor
- `HKQuantityTypeIdentifier.activeEnergyBurned`
- `HKQuantityTypeIdentifier.bodyMass` — can pre-populate weight suggestions

---

## WatchKit / watchOS App

**Architecture:** For new watchOS apps, use **SwiftUI only** — WatchKit storyboard approach is legacy. The `WKApplication` / `WKApplicationDelegate` handles background tasks.

**Extended Runtime Sessions** — critical for workout timers:
```swift
let session = WKExtendedRuntimeSession()
session.delegate = self
session.start()  // Keeps app alive for up to 1 hour during workout
```
Without this, watchOS suspends your app when the user lowers their wrist during a rest timer.

**Background tasks for TriCon use cases:**
- `WKSnapshotRefreshBackgroundTask` — update complication/widget after saving a session
- `WKApplicationRefreshBackgroundTask` — schedule next-day workout reminder

**Complication / Widget:** Use `WidgetKit` (not old WatchKit complications API) for current watchOS. Display today's workout name and status.

---

## SwiftData — Persistence (Preferred over Core Data for new apps)

**What it is:** Swift-native persistence layer. Replaces Core Data boilerplate with macros.

**Minimal setup:**
```swift
@Model
class WorkoutSession {
    var type: String       // "upper" | "lower" | "amrap" | "circuit"
    var date: Date
    var durationSeconds: Int
    var volumeKg: Double
    var amrapRounds: Int?

    @Relationship(deleteRule: .cascade) var setLogs: [SetLog]

    init(type: String, date: Date, durationSeconds: Int, volumeKg: Double) { ... }
}

@Model
class SetLog {
    var exerciseId: String
    var weightKg: Double
    var reps: Int
    var setIndex: Int
}
```

**In SwiftUI:**
```swift
@Query(sort: \WorkoutSession.date, order: .reverse) var sessions: [WorkoutSession]
@Environment(\.modelContext) private var context

// Insert
context.insert(WorkoutSession(...))

// Fetch with predicate
@Query(filter: #Predicate<WorkoutSession> { $0.type == "upper" }) var upperSessions: [WorkoutSession]
```

**Migration:** Use `VersionedSchema` + `SchemaMigrationPlan` for adding fields without losing user data.

**Core Data** — still valid, especially for CloudKit sync via `NSPersistentCloudKitContainer`. SwiftData also supports CloudKit sync but is newer.

---

## CloudKit — Cross-Device Sync

**When to use:** Sync workout history across user's iPhone + Apple Watch + iPad.

**Two approaches:**
1. **SwiftData + CloudKit** (simplest): add `.cloudKitContainerOptions` to `ModelConfiguration` — automatic mirroring
2. **CloudKit directly** with `CKSyncEngine` (more control): manages conflict resolution and change tokens

**Setup:**
- Enable iCloud + CloudKit in Xcode Signing & Capabilities
- Requires valid iCloud account (don't assume it's always available — handle gracefully)
- `CKContainer.default().privateCloudDatabase` — per-user data (workout history)
- `CKContainer.default().publicCloudDatabase` — shared data (e.g. program templates)

**Offline-first rule:** Always write to local SwiftData first, then sync to CloudKit asynchronously. Never block UI on network.

---

## StoreKit — In-App Purchases

**Current API:** `StoreKit 2` (Swift concurrency, no delegates).

**Product types relevant to fitness apps:**
- `.nonConsumable` — one-time "unlock premium program" purchase
- `.autoRenewable` — monthly/annual subscription for coaching features
- `.nonRenewing` — time-limited access (e.g. 12-week program pass)

**Minimal IAP flow:**
```swift
// Fetch products
let products = try await Product.products(for: ["com.tricon.premium"])

// Purchase
let result = try await product.purchase()
switch result {
case .success(let verification):
    let transaction = try verification.payloadValue  // Always verify
    await transaction.finish()
case .userCancelled, .pending: break
}

// Entitlement check on app launch
for await result in Transaction.currentEntitlements {
    if case .verified(let transaction) = result {
        // Grant access
    }
}
```

**App Review:** Apple takes 30% on IAP. Fitness apps with subscription workouts must use IAP — cannot link to external payment in-app (see App Review Guideline 3.1.1).

**Receipt validation:** Use `AppTransaction` for app-level purchase, individual `Transaction.currentEntitlements` for active subscriptions. Server-side validation via App Store Server API recommended for subscriptions.

---

## User Notifications — Workout Reminders

**Local notification for workout reminder:**
```swift
let content = UNMutableNotificationContent()
content.title = "Monday — Upper Body"
content.body = "TriCon 3-3-3 · 60 min · Time to lift 💪"
content.sound = .default
content.categoryIdentifier = "WORKOUT_REMINDER"

// Trigger: every Monday at 9am
var components = DateComponents()
components.weekday = 2  // Monday
components.hour = 9
let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

let request = UNNotificationRequest(identifier: "upper-body-reminder", content: content, trigger: trigger)
try await UNUserNotificationCenter.current().add(request)
```

**Actionable notifications** (user can start workout from banner):
```swift
let startAction = UNNotificationAction(identifier: "START_WORKOUT", title: "Start Now", options: .foreground)
let category = UNNotificationCategory(identifier: "WORKOUT_REMINDER", actions: [startAction], intentIdentifiers: [])
UNUserNotificationCenter.current().setNotificationCategories([category])
```

---

## AVAudioSession — Audio for Beep Timers

The TriCon app uses beep timers. For native iOS, use `AVAudioSession`:

```swift
// Allow beeps to play even when iPhone is on silent / during another app's audio
try AVAudioSession.sharedInstance().setCategory(.ambient, options: .mixWithOthers)
try AVAudioSession.sharedInstance().setActive(true)
```

For workout beep sounds, `AudioServicesPlaySystemSound` is simpler than AVAudioPlayer:
```swift
import AudioToolbox
AudioServicesPlaySystemSound(1057)  // "Tink" — use for rep complete
AudioServicesPlaySystemSound(1025)  // "Tock" — use for countdown tick
```

---

## Security / Keychain

Store sensitive tokens (e.g. user auth, API keys) in the Keychain — **never** in `UserDefaults` or `AppStorage`.

```swift
// Using swift-keychain-wrapper or raw SecItem API:
let tag = "com.tricon.usertoken".data(using: .utf8)!
let query: [String: Any] = [
    kSecClass as String: kSecClassKey,
    kSecAttrApplicationTag as String: tag,
    kSecReturnRef as String: true
]
// SecItemAdd / SecItemCopyMatching / SecItemDelete
```

**For TriCon** — if adding user accounts/coaching backend, store JWT in Keychain via `kSecClassGenericPassword`.

---

## Distribution & App Store

**TestFlight:**
- Upload via Xcode: Product → Archive → Distribute → TestFlight
- External testers: up to 10,000 testers, requires basic App Review
- Internal testers: up to 100 (team members), instant

**App Store Connect requirements:**
- At least one screenshot per device size (6.5" iPhone required)
- Privacy Nutrition Labels (declare HealthKit data use)
- Health category apps require a disclaimer: "Not intended to diagnose, treat, cure, or prevent any disease"

**App Review rules relevant to fitness apps (from guidelines):**
- 2.5.1: App must not use background modes for anything not disclosed (workout background audio/timer must be declared)
- 3.1.1: Must use IAP for digital goods — no linking to external payment
- 5.1.1: Must include Privacy Policy if collecting health data
- HealthKit data must not be shared with third parties for advertising

**Signing certificates (Xcode 15+):** Use cloud-managed certificates — Xcode handles automatically. No manual provisioning profile management needed for most cases.

**Swift Package Manager (SPM):**
- `File → Add Package Dependency` in Xcode
- Pin to semantic version (major/minor) — avoid pinning to exact commit
- Only add packages from trustworthy authors; binary dependencies carry additional risk

---

## Alternate App Icons

Useful for TriCon — dark mode icon, seasonal icons, premium user icon:

```swift
UIApplication.shared.setAlternateIconName("TriConPremium") { error in
    if let error { print("Icon change failed: \(error)") }
}
// Pass nil to revert to primary icon
```

**Build setup:** Add icons to asset catalog — set `ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES` in build settings.

---

## Combine — Reactive Data Flows (SwiftUI alternative to callbacks)

Use Combine for:
- Timer publishers: `Timer.publish(every: 1, on: .main, in: .common).autoconnect()`
- Debouncing weight-input field: `.debounce(for: 0.3, scheduler: DispatchQueue.main)`
- Chaining HealthKit async queries when Combine is already in codebase

In modern SwiftUI codebases, prefer `async/await` + `@Observable` over Combine for new code. Combine is still stable and used by Apple's own frameworks.

---

## Key Stack Decision for TriCon Native App

| Need | Recommendation |
|------|---------------|
| UI | SwiftUI (all platforms) |
| Persistence | SwiftData + CloudKit sync |
| Workout data | HealthKit `HKWorkoutBuilder` |
| State management | `@Observable` macro (Swift 5.9+) |
| Timer (workout clock) | `TimelineView` + `WKExtendedRuntimeSession` on Watch |
| Notifications | `UserNotifications` framework |
| IAP | StoreKit 2 |
| Audio beeps | `AudioServicesPlaySystemSound` |
| Auth (if added) | Sign in with Apple (`AuthenticationServices`) |
| Secrets | Keychain (`Security` framework) |
