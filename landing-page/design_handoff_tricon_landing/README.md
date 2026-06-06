# Handoff: TRICON — Landing / Welcome Screen

## Overview
A single-screen mobile **landing / welcome screen** for "TRICON Workout," a strength-training app aimed at older athletes. It presents the brand logo, a tagline, and two primary entry actions (Create Account / Log In) over a dimmed gym photo. This is the first screen a logged-out user sees.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via inline Babel JSX)** — a prototype showing the intended look and behavior. They are **not production code to copy directly**.

The task is to **recreate this design in your target codebase's environment** (React Native, SwiftUI, Flutter, Jetpack Compose, plain React web, etc.), using its established components, theming, and conventions. If no UI environment exists yet, pick the framework most appropriate for the product and implement the screen there.

Note: the prototype is wrapped in a faux iOS device bezel (`ios-frame.jsx`) and ships an in-canvas "Tweaks" panel (`tweaks-panel.jsx`) and a drag-and-drop image placeholder (`image-slot.js`). **These three are prototype scaffolding only — do not port them.** Only the screen content inside them is the deliverable.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and layout are intentional and specified below. Recreate the screen pixel-accurately using your codebase's libraries. The barbell-triangle logo is the one piece that is drawn as inline SVG and should be reproduced faithfully (see Assets).

## Screens / Views

### Welcome Screen
- **Purpose:** Brand entry point; user chooses to create an account or log in.
- **Canvas:** Full-bleed mobile screen. Prototype device frame is 402 × 874 pt (iPhone-class). Background is solid black `#000` with a full-bleed background photo behind a scrim.
- **Vertical layout (top → bottom), as a single column filling the screen:**
  1. **Top wordmark** — pinned near top, left-aligned, just below the status bar.
  2. **Hero** — flex region that grows to fill remaining space; vertically + horizontally centered. Contains the circular logo badge and the tagline.
  3. **Actions** — pinned to the bottom; two stacked buttons + a text link.

#### Background
- Full-bleed photo (`assets/gym-bg.png`), `object-fit: cover`, rendered **grayscale** (`filter: grayscale(1) contrast(1.05)`).
- **Dim scrim:** solid black overlay at **28% opacity** over the photo (tunable 0–85%).
- **Gradient scrim** (top→bottom) for legibility:
  `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 22%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.92) 100%)`

#### Top wordmark
- Left-aligned row, padding `60px 30px 0`. `display:flex; align-items:center; gap:11px`.
- **Glyph:** a hollow triangle outline, 26 × 26 px. White (`#fff`) stroke, `stroke-width` ~22 in a 0 0 300 300 viewBox, rounded joins/caps. Polygon points `150,52 248,222 52,222`.
- **Text "TRICON":** Oswald 600, `16px`, color **gold `#e3b23f`**, `letter-spacing: 0.42em` (apply equivalent trailing indent so the spacing doesn't visually push it off-center).

#### Logo badge (hero)
- **Circle:** 340 × 340 px, `border-radius:50%`, `box-sizing:border-box`.
  - **Rim:** `4px solid` gold `#e3b23f`.
  - **Fill:** `radial-gradient(circle at 38% 30%, #fcfbf7 0%, #f2eee3 64%, #e7e1d2 100%)` (warm cream).
  - **Shadows:** `0 22px 60px rgba(0,0,0,0.55)`, `0 0 0 1px rgba(0,0,0,0.25)`, `0 0 38px rgba(227,178,63,0.28)` (gold glow), `inset 0 0 0 1px rgba(255,255,255,0.7)`.
  - The whole badge is shifted up `translateY(-38px)` from the hero's vertical center.
- **Barbell-triangle mark:** inline SVG filling the circle (absolute, inset 0). An equilateral triangle whose three sides are loaded barbells; plates cluster near each corner. Mark color **near-black `#1b1a18`**. See Assets for the exact geometry — reproduce it as a vector asset.
- **Wordlock** (centered over the mark, nudged `translateY(-19px)`):
  - **"TRICON":** Oswald 700, `66px`, color **gold `#e3b23f`**, `letter-spacing:0.01em`.
  - **"WORKOUT":** Oswald 500, `20px`, color **black `#1b1a18`**, `letter-spacing:0.46em`, sits directly under TRICON.
  - **Barbell knockout:** the barbell mark must NOT show through the "TRICON" word. A band the height of the TRICON text is painted with the **identical circle gradient** and clipped to just that band, sitting above the mark but below the text — so the bars are cut cleanly behind TRICON with no visible seam. (In CSS this is a `.cut` layer: `position:absolute; inset:0; border-radius:50%; background:<same radial gradient>; clip-path: inset(31% 5% 49% 5%)`.) In your platform, achieve the same result however is idiomatic (e.g., draw a cream rectangle matching the badge fill behind the TRICON glyphs, or render the wordmark on an opaque chip sampled from the badge fill).

#### Tagline
- Below the badge. Centered, `max-width: 320px`.
- Oswald 400, **`16px`**, uppercase, `letter-spacing:0.16em`, `line-height:1.55`, color `rgba(255,255,255,0.72)`, `text-wrap:balance`.
- Copy: **"Training method for the older and wiser athlete"** (rendered uppercase).

#### Actions (bottom)
- Column, `gap:14px`, padding `0 22px 30px`.
- **Buttons:** height `58px`, `border-radius:16px`, Oswald 600, `17px`, uppercase, `letter-spacing:0.12em`, no border.
  - **Create Account** (primary-light): bg `#f3f1ea`, text `#1a1916`, `box-shadow:0 6px 18px rgba(0,0,0,0.3)`. Copy: "Create Account".
  - **Log In** (gold): bg `linear-gradient(180deg, #e3b23f 0%, #cf9a2b 100%)`, text `#2e2206`, shadows `0 8px 26px rgba(227,178,63,0.45)`, `0 2px 6px rgba(0,0,0,0.3)`, `inset 0 1px 0 rgba(255,255,255,0.4)`. Copy: "Log In".
- **Text link row:** centered, `12.5px`, uppercase, `letter-spacing:0.14em`, color `rgba(255,255,255,0.5)`; the word "Restore purchase" is bold and gold `#e3b23f`. Copy: "Member already? **Restore purchase**".

## Interactions & Behavior
- **Create Account** → navigate to sign-up flow.
- **Log In** → navigate to login flow.
- **Restore purchase** → trigger the platform's restore-purchases routine.
- No animations are required. If you add entrance motion, keep the end-state as the base style (don't hide content behind animation on first paint).
- Buttons should have standard pressed/hover feedback per your platform (subtle scale or opacity).

## State Management
- None on this screen beyond navigation intent. It is a static entry screen.
- (Prototype-only tweak state — gold color, scrim dim, grayscale toggle, tagline text — is authoring convenience and not part of the shipped app.)

## Design Tokens
**Colors**
- Gold (primary): `#e3b23f`
- Gold deep (gradient end): `#cf9a2b`
- Gold text-on-button: `#2e2206`
- Mark / near-black ink: `#1b1a18`
- Cream badge fill: `#fcfbf7` → `#f2eee3` → `#e7e1d2` (radial)
- Light button: `#f3f1ea`, ink `#1a1916`
- Screen background: `#000`
- White text @ 72% / 50% opacity for tagline / link

**Typography** — single family: **Oswald** (Google Fonts, weights 300/400/500/600/700).
- Top wordmark: 16 / 600 / 0.42em
- TRICON (badge): 66 / 700 / 0.01em
- WORKOUT: 20 / 500 / 0.46em
- Tagline: 16 / 400 / 0.16em, uppercase
- Buttons: 17 / 600 / 0.12em, uppercase
- Link: 12.5 / 400 / 0.14em, uppercase

**Radii:** badge 50%; buttons 16px.
**Spacing:** screen side padding ~22–30px; button height 58px; action gap 14px.

## Assets
- **`assets/gym-bg.png`** — placeholder hero photo. Replace with the brand's own gym/training photo. Rendered grayscale + cover.
- **Barbell-triangle logo** — currently inline SVG inside `tricon-app.jsx` (the `TriconMark` component). Geometry summary: equilateral triangle (sides = loaded barbells); each bar end carries a **collar** plus **three graded plates** (largest inboard → smallest at the corner), plate clusters pulled inboard so adjacent corners' plates do **not** touch. Recommend exporting this to a single SVG file and shipping it as the app logo. The triangle-outline top glyph is also inline SVG.
- **Font:** Oswald via Google Fonts (or bundle the webfont/native equivalent).

## Files
- `TRICON Landing.html` — host page: all CSS (design tokens, layout, badge, knockout) lives in the `<style>` block here. **Primary reference.**
- `tricon-app.jsx` — the screen itself: markup tree, the `TriconMark` barbell SVG geometry, the top-glyph SVG, and default copy/tweak values.
- `ios-frame.jsx` — prototype device bezel/status bar. **Scaffolding — do not port.**
- `tweaks-panel.jsx` — prototype tweak controls. **Scaffolding — do not port.**
- `image-slot.js` — prototype drag-drop image placeholder used for the bg photo. **Scaffolding — do not port.**

To preview the prototype: open `TRICON Landing.html` in a browser (it loads React + Babel from CDN and the JSX files alongside it).
