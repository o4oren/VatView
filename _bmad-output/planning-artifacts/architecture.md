---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-14'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-VatView-2026-03-14.md'
  - '_bmad-output/project-context.md'
  - 'docs/index.md'
  - 'docs/project-overview.md'
  - 'docs/architecture.md'
  - 'docs/state-management.md'
  - 'docs/data-models.md'
  - 'docs/api-contracts.md'
  - 'docs/component-inventory.md'
  - 'docs/source-tree-analysis.md'
  - 'docs/technology-stack.md'
  - 'docs/development-guide.md'
  - 'docs/asset-inventory.md'
workflowType: 'architecture'
project_name: 'VatView'
user_name: 'Oren'
date: '2026-03-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
43 functional requirements covering the complete UI transformation. Architecturally, they decompose into:
- **Map surface layer** (FR1-8): Full-bleed edge-to-edge map as primary app surface, with translucent overlays for all detail panels. This is the foundational architectural change — the map becomes the base layer, everything else floats above it.
- **Progressive disclosure system** (FR9-11): Single complete card per detail type with content ordered by information priority. The bottom sheet snap points (peek/half/full) control how much of the card is physically visible. 5 detail card components (pilot, ATC, CTR, airport ATC, airport) — no conditional content rendering based on disclosure level.
- **Navigation replacement** (FR12-14): Bottom tab bar replaced by a floating navigation island. Architecturally the highest-risk structural change — moves from React Navigation's built-in tab bar to a custom overlay component that must drive React Navigation state while managing its own positioning, auto-hide behavior, and safe area handling. Unlike NativeWind (which has styling fallbacks), the floating nav island has no graceful fallback — if it doesn't work cleanly with React Navigation, the core design vision is compromised.
- **Theming infrastructure** (FR29-33): Design token system for light/dark themes with custom Google Maps styling per theme. Must be extensible for Phase 2 aviation themes without restructuring.
- **Adaptive layout** (FR34-37): Portrait/landscape orientation support with responsive repositioning of all floating elements and bottom-sheet ↔ side-panel transitions.
- **Feature parity** (FR43): All 28 existing components restyled — no feature removals.

**Non-Functional Requirements:**
17 NFRs that directly shape architecture:
- **Performance** (NFR1-7): 60fps animations including backdrop blur, 1,500+ markers without dropped frames, 300ms orientation transitions, no cold start regression. The blur performance requirement (NFR4) demands a fallback path — the architecture must support both blur and solid-background rendering per device capability.
- **Integration** (NFR8-11): Graceful degradation for all external data sources (VATSIM API, Google Maps styling). No new integrations — preserving existing pipeline stability.
- **Compatibility** (NFR12-14): NativeWind must coexist with StyleSheet during migration. All existing third-party libraries must continue working — this is a hard constraint that may limit NativeWind adoption scope.
- **Visual quality** (NFR15-17): Consistent translucency, no hardcoded colors, theme-aware map styling. Design token enforcement is an architectural concern, not just a style guide.

**Scale & Complexity:**

- Primary domain: Cross-platform mobile (React Native / Expo)
- Complexity level: Medium
- Estimated architectural components: ~32 (28 existing restyled + new: FloatingNavIsland, ThemeProvider, MapOverlayGroup, BlurWrapper, TranslucentSurface, ThemedText, ListItem, StaleIndicator, ThemePicker, FloatingFilterChips, DetailPanelProvider, AircraftIconService, design token system, 5 detail card components)

### Technical Constraints & Dependencies

| Constraint | Impact | Source |
|---|---|---|
| No TypeScript | Component contracts must be maintained through conventions and project-context rules, not types | Project rule |
| No Redux Toolkit | State management stays as-is — no store migration | Project rule |
| react-native-paper removal | Every component using Paper (all 28) must be restyled | PRD FR1-8, FR43 |
| NativeWind + react-native-maps compatibility | Unknown — must validate before committing to NativeWind for map overlay components | PRD risk table |
| NativeWind + @gorhom/bottom-sheet compatibility | Unknown — must validate before committing to NativeWind for bottom sheet | PRD risk table |
| Backdrop blur — iOS only | Android uses solid translucency (permanent design decision per UX spec), iOS uses native backdrop blur | NFR4, UX spec |
| Google Maps custom styling | Two complete JSON style sets needed (light + dark), managed separately from NativeWind tokens | FR32 |
| Expo SDK 55 | Determines available NativeWind version and native module compatibility | Current stack |
| Solo developer + AI-assisted | Migration strategy should favor incremental, testable steps over big-bang | Product brief |
| @gorhom/bottom-sheet has no side panel mode | Landscape adaptive layout requires a custom detail panel abstraction — bottom-sheet doesn't support horizontal/side-panel rendering | FR36, Amelia (Dev) |

### Cross-Cutting Concerns Identified

1. **Navigation architecture** — Highest-risk structural change. The floating navigation island replaces React Navigation's built-in tab bar but must still drive React Navigation state. Unlike styling concerns (which have fallbacks), this is structural — the tab bar visibility, the custom pill component, safe area handling, and auto-hide behavior must all work with React Navigation's navigator or the core design vision fails. Must be validated early and independently.

2. **Detail Panel Abstraction** — The detail views (PilotDetails, AtcDetails, CtrDetails, AirportAtcDetails, ClientDetails) currently render inside `@gorhom/bottom-sheet`. Phase 1 requires them to render in either a bottom sheet (portrait) or side panel (landscape) without code duplication. The architecture needs a `DetailPanelProvider` or equivalent abstraction that: (a) provides the container (sheet or panel) based on orientation, (b) exposes snap points / disclosure levels to children, (c) handles open/close/select lifecycle uniformly, (d) maintains the same Redux integration (`clientSelected` → open panel).

3. **Design token system with dual consumers** — Affects every component plus the map. The theme architecture has TWO token systems that must stay coordinated: (a) NativeWind/Tailwind tokens for app UI components, and (b) Google Maps JSON style objects for map appearance. These use completely different formats — NativeWind tokens cannot be referenced from inside Google Maps style JSON. The architecture must define a single source-of-truth color palette (likely `theme.js`) that exports both NativeWind config values AND the Maps JSON styles. If they diverge, you get mismatched themes (e.g., light app UI on dark map). Phase 2 extensibility for aviation themes required.

4. **Translucency/blur rendering** — Floating nav, bottom sheet, filter chips, and any overlay surface. Needs a shared blur wrapper component with platform-based rendering: iOS uses native backdrop blur (`UIVisualEffectView`), Android uses semi-transparent solid background with 1px border + elevation shadow (permanent platform design decision per UX spec — no Android blur attempted, regardless of Android version).

5. **Progressive disclosure content architecture** — 5 detail card components (one per detail type). Each card renders all content ordered by information priority (most glanceable at top, full detail below). The bottom sheet snap points control how much of the card is physically visible — no conditional content rendering needed. Design dependency is limited to defining content priority order per detail type.

6. **Migration coexistence** — NativeWind and StyleSheet.create() must work side-by-side during the incremental migration. The architecture must define clear boundaries for which components use which system and when.

7. **Map performance** — 20s polling cycle with 1,500+ markers and polygon overlays. Adding translucent overlays on top of the map adds rendering load. The architecture must ensure overlay rendering doesn't compete with map tile rendering.

## Starter Template Evaluation

### Primary Technology Domain

**Cross-platform mobile (React Native / Expo)** — existing brownfield app on Expo SDK 55 / React Native 0.83. No project scaffolding needed; this evaluation covers new libraries added to the existing codebase for the UI migration.

### New Libraries Evaluated

#### NativeWind (Tailwind CSS for React Native)

**Option A: NativeWind v4.2.2** (stable, current)
- Production-ready, actively maintained
- Compatible with Expo SDK 55 via v4.2.0+ (includes Reanimated v4 patch)
- Known limitation: `className` does not apply directly to `BottomSheetView` — requires wrapping children with regular `View` components
- Works with the New Architecture (required by SDK 55)

**Option B: NativeWind v5** (pre-release, NOT for production)
- Requires React Native 0.81+ (compatible with 0.83)
- No stable release date announced
- Migration guide from v4→v5 exists, so starting on v4 is safe

**Selected: NativeWind v4.2.2** — stable, compatible, with clear upgrade path to v5.

#### Blur / Translucency

**expo-blur (SDK 55 version)**
- Uses new `RenderNode` API on Android 12+ for significantly better blur performance
- Falls back to `RenderScript` on older Android versions
- Requires `BlurTargetView` wrapper on Android for the performant path
- Native iOS blur is already performant
- Already in the Expo ecosystem — no additional native dependency

**Selected: expo-blur** — ships with Expo SDK 55, used for iOS native backdrop blur only. **Android does not use blur** — per UX spec, Android renders semi-transparent solid backgrounds with 1px border + elevation shadow as a permanent platform design decision (Android's software blur cannot reliably render at 60fps across multiple overlapping surfaces).

#### Orientation / Responsive Layout

**expo-screen-orientation + useWindowDimensions()**
- Already in the Expo ecosystem
- Provides orientation lock/unlock and change listeners
- Combined with `useWindowDimensions()` for responsive layout decisions

**Selected: expo-screen-orientation + useWindowDimensions()** — no additional library needed.

#### Theme Architecture

No new library needed. Extends existing `theme.js` pattern:
- `theme.js` becomes single source of truth exporting: `lightTheme`, `darkTheme`, `lightMapStyle`, `darkMapStyle`, and NativeWind Tailwind preset values
- NativeWind's Tailwind config references these tokens
- React context provides the active theme to the component tree
- `useColorScheme()` from React Native provides system preference detection

### Selected Approach: Brownfield Migration Stack

**Rationale:** Minimize new dependencies. Use stable, Expo-native libraries. Keep the upgrade path to NativeWind v5 open. Leverage SDK 55's improved expo-blur performance.

**Installation Commands:**

```bash
# NativeWind v4 + Tailwind CSS
npm install nativewind@^4.2.2 tailwindcss@^3.4.0

# Blur (Expo SDK 55)
npx expo install expo-blur

# Orientation (Expo SDK 55)
npx expo install expo-screen-orientation
```

**Configuration Required:**
- `tailwind.config.js` — NativeWind preset, content paths, theme token extension
- `babel.config.js` — add NativeWind Babel plugin
- `metro.config.js` — add NativeWind Metro plugin (withNativeWind wrapper)
- `global.css` — Tailwind directives (`@tailwind base/components/utilities`)

### Architectural Decisions Provided by This Stack

| Decision | Choice | Rationale |
|---|---|---|
| Styling system | NativeWind v4.2.2 (Tailwind) | Stable, Expo SDK 55 compatible, v5 upgrade path |
| Blur/translucency | expo-blur (SDK 55) | RenderNode API on Android 12+, native iOS blur, built-in fallback |
| Orientation detection | expo-screen-orientation + useWindowDimensions | Expo-native, no extra dependency |
| Theme tokens | Extended theme.js + NativeWind Tailwind config + React context | Single source of truth for both UI tokens and Google Maps JSON styles |
| Migration strategy | Incremental — NativeWind coexists with StyleSheet.create() | PRD-specified, NFR13-compatible |
| Bottom sheet styling | StyleSheet.create() for container, NativeWind for content inside | Known NativeWind/bottom-sheet className limitation |

**Note:** The bottom sheet styling limitation (NativeWind classes don't apply directly to `BottomSheetView`) is a known issue. The architecture accounts for this by using `StyleSheet.create()` for the bottom sheet container/backdrop and NativeWind for the content rendered inside the sheet.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Theme Context Architecture — Hybrid NativeWind dark: + lightweight context
2. Navigation Island Architecture — Hide tab bar + custom overlay
3. Detail Panel Abstraction — Provider pattern, portrait-only initially
4. Progressive Disclosure Snap Points — Hybrid percentage with min/max
5. Migration Order — Infrastructure-first, then screens top-down
6. Blur Wrapper Design — BlurWrapper (iOS blur / Android solid translucency)

**Deferred Decisions (Post-Phase 1):**
- Landscape side panel implementation (abstraction ready, container deferred)
- Aviation theme collection structure (token system extensible, themes deferred)
- Single-surface navigation (Phase 2)
- Social features architecture (Phase 2+)

### Theme Context Architecture

**Decision:** Hybrid — NativeWind `dark:` variants for UI components + lightweight React context for Maps styling and manual override.

**Rationale:** Plays to NativeWind's strengths for UI styling. Avoids duplicating what NativeWind already handles. Context only manages what NativeWind can't reach: Google Maps JSON style objects, manual theme override state, and persisted preference.

**Implementation:**
- NativeWind handles all UI component theming via `dark:` class variants
- `ThemeContext` provides: `activeMapStyle` (light/dark JSON), `isDark` (boolean), `toggleTheme()`, `themePreference` ('system' | 'light' | 'dark')
- `useColorScheme()` detects system preference; manual override stored in AsyncStorage
- `theme.js` exports: color palette, `lightMapStyle`, `darkMapStyle`, NativeWind Tailwind config values
- **Affects:** Every component (NativeWind classes), MapComponent (map style), Settings (toggle)

### Navigation Island Architecture

**Decision:** Use a custom `FloatingNavIsland` as the Tab Navigator's `tabBar` with overlay styling (no per-screen render).

**Rationale:** Lowest-risk approach. React Navigation's tab navigator continues to manage screen state, caching, and back behavior. The floating island is a styled button group that calls `navigate()`. Instant fallback: re-enable tab bar visibility.

**Implementation:**
- `MainTabNavigator` sets `tabBar={(props) => <FloatingNavIsland {...props} />}`
- Overlay style applied via `tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 }`
- `FloatingNavIsland` receives `{ state, navigation }` from React Navigation and calls `navigation.navigate(tabName)`; logs `analytics.logEvent('nav_tab_switch', { tab_name })` on press
- Positioned with `TranslucentSurface` and `useSafeAreaInsets()`; not rendered inside `VatsimMapView`
- Auto-hide behavior (planned): hides during map pan gestures, reappears on tap/idle
- **Affects:** MainTabNavigator (centralized), all tab screens (visual context)

### Detail Panel Abstraction

**Decision:** Build `DetailPanelProvider` abstraction now, implement portrait bottom sheet only. Landscape side panel added later without touching detail views.

**Rationale:** All 5 detail views code against the provider API from day one. When landscape ships (Phase 1 or OTA follow-up), only the side panel container needs implementing — zero changes to PilotDetails, AtcDetails, CtrDetails, AirportAtcDetails, or ClientDetails.

**Implementation:**
- `DetailPanelProvider` wraps the map screen
- Exposes API: `isOpen`, `open(client)`, `close()`, `selectedClient`
- Portrait: renders `@gorhom/bottom-sheet` with three snap points
- Landscape: stub/TODO — renders side panel container when implemented
- Listens to orientation via `useWindowDimensions()` to select container
- Integrates with Redux: `clientSelected` action dispatches → provider opens
- **Affects:** VatsimMapView, ClientDetails, all 5 detail view components

### Progressive Disclosure Snap Points

**Decision:** Hybrid percentage-based snap points with min/max constraints. Single complete card per detail type — sheet snap points control physical visibility.

**Rationale:** Scales with device size (phone vs tablet) while guaranteeing minimum usability on small screens. Single-card model eliminates conditional content rendering, reducing component count and bug surface.

**Implementation:**
- Level 1 (peek): ~155px — ClientCard/AirportCard summary, opacity 0.45
- Level 2 (half): ~50% — data grid, route, ATIS, opacity 0.65
- Level 3 (full): ~90% — complete info, scrollable, opacity 0.85
- `DetailPanelProvider` tracks current snap index for MapOverlayGroup coordination (opacity, floating element positioning)
- Detail views render a single complete card; the sheet snap points determine how much is physically visible
- **Affects:** DetailPanelProvider, all 5 detail view components (content organization)

### Migration Order

**Decision:** Infrastructure-first, then screens top-down by priority.

**Rationale:** Front-loads shared components so every screen migration is straightforward. Map screen comes early for maximum validation of NativeWind + react-native-maps + blur interaction.

**Implementation Sequence:**
1. **Infrastructure:** NativeWind config, tailwind.config.js (including animation tokens), global.css, babel/metro plugins, bundle JetBrains Mono font
2. **Theme system:** Extended theme.js, ThemeContext, BlurWrapper
3. **Shared UI components:** TranslucentSurface, ThemedText, ListItem, StaleIndicator
4. **Map navigation:** FloatingNavIsland, FloatingFilterChips, MapOverlayGroup, DetailPanelProvider, tab cross-fade transitions
5. **Map screen:** VatsimMapView (full-bleed + MapOverlayGroup), MapComponent (zoom callback + dual theme styles), AircraftIconService, PilotMarkers (SVG→bitmap), AirportMarkers (zoom-aware 3-band), CTRPolygons
6. **Detail views:** ClientDetails, PilotDetails, AtcDetails, CtrDetails, AirportAtcDetails — single detail card per type
7. **List view:** VatsimListView + FilterBar
8. **Airport view:** AirportDetailsView, AirportSearchList, AirportListItem
9. **Events + Bookings:** VatsimEventsView, EventListItem, EventDetailsView, BookingsView, BookingDeatils
10. **Secondary screens:** Settings (ThemePicker), About, NetworkStatus, MetarView, LoadingView
11. **Polish:** Remove react-native-paper dependency, accessibility audit (VoiceOver/TalkBack), reduced motion verification, final visual QA, both platforms

### Blur Wrapper Design

**Decision:** Reusable `BlurWrapper` component with platform-based rendering (iOS blur, Android solid translucency).

**Rationale:** Platform check is a simple `Platform.OS` comparison — no capability detection needed. iOS gets native hardware-accelerated blur. Android gets a premium clean-glass aesthetic with semi-transparent backgrounds + 1px border + elevation shadow. This is a permanent design decision per the UX spec, not a degradation — both platforms deliver a premium translucent surface, just expressed differently.

**Implementation:**
- `BlurWrapper` component checks `Platform.OS`: iOS → renders `BlurView` (expo-blur); Android → renders semi-transparent `View` with 1px border (`surface.border` token) and elevation shadow
- Props: `intensity` (default 45, iOS only), `tint` (auto from theme: light/dark), `opacity` (default 0.45)
- Three opacity levels from UX spec tokens: `surface` (0.45 default), `surface-dense` (0.65 for busy map backgrounds), `overlay` (0.85 for full-detail panels)
- Used by: FloatingNavIsland, DetailPanelProvider (sheet backdrop), FloatingFilterChips, TranslucentSurface
- **Affects:** All translucent UI surfaces, Settings (future toggle)

**Note:** `PlatformCapabilityProvider` is no longer needed — the platform check is simple enough to live inside `BlurWrapper` directly. Removed from the provider hierarchy.

### MapOverlayGroup — Floating Element Orchestrator

**Decision:** Centralized layout orchestrator component for all floating elements on the map view.

**Rationale:** Multiple floating elements (nav island, filter chips, detail sheet, stale indicator) must coordinate their positions when the sheet state changes, orientation changes, or nav island auto-hides. Without a single orchestrator, each element positions itself independently, leading to overlap bugs and duplicated layout logic.

**Implementation:**
- `MapOverlayGroup` wraps all floating elements on the map screen
- Receives props: `sheetState` (closed/peek/half/full), `orientation`, `navIslandVisible`, `zoomLevel`
- Manages z-ordering, spatial relationships, and coordinated repositioning:
  - Sheet closed: all elements at default positions
  - Sheet at peek: filter chips remain, nav island visible
  - Sheet at half: filter chips shift up if occluded
  - Sheet at full: filter chips hidden, nav island remains above sheet
  - Landscape: side panel replaces detail sheet, filter chips shift left
- Children: FloatingNavIsland, FloatingFilterChips, StaleIndicator, DetailSheet/SidePanel
- **Location:** `app/components/mapOverlay/MapOverlayGroup.jsx`
- **Affects:** VatsimMapView (wraps all floating elements), FloatingNavIsland, FloatingFilterChips, DetailPanelProvider, StaleIndicator

### AircraftIconService — SVG-to-Bitmap Pipeline

**Decision:** Pre-render SVG aircraft silhouettes from FSTrAk project into cached `ImageSource` objects for native map markers.

**Rationale:** SVG View markers for 1,500+ pilots cause frame drops. Pre-rendered bitmaps give SVG benefits (resolution independence, theme-awareness) with native `Image` marker performance. Replaces current PNG-based `iconsHelper.js`.

**Implementation:**
- `aircraftIconService.js` in `app/common/`
- `init(theme)` called on app start and theme change — renders each (aircraftType × sizeVariant × themeColor) combination into cached `ImageSource`
- `getMarkerImage(aircraftType, sizeVariant) → ImageSource` — synchronous lookup after init
- Cache regenerates on theme change (accent color differs between light/dark)
- **Migration:** Current `getAircraftIcon(type) → [require('...png'), size]` becomes `getMarkerImage(type, variant) → ImageSource`
- **Affects:** PilotMarkers.jsx, iconsHelper.js (replaced)

**SVG Assets (15 files in `assets/svg/`):**

All SVGs are single-path silhouettes with 32x32 viewBox, no fill color (filled at render time with theme accent color):

| File | Icon Key | Description |
|---|---|---|
| `a320.svg` | A320 | Airbus A320 family |
| `a330.svg` | A330 | Airbus A330/A350 family |
| `a340.svg` | A340 | Airbus A340 / quad-jet |
| `a380.svg` | A380 | Airbus A380 super-jumbo |
| `b737.svg` | B737 | Boeing 737 family |
| `b747.svg` | B747 | Boeing 747 jumbo |
| `b767.svg` | B767 | Boeing 767 |
| `b777.svg` | B777 | Boeing 777 |
| `b787.svg` | B787 | Boeing 787 Dreamliner |
| `c172.svg` | C172 | Cessna/GA single-engine |
| `dc3.svg` | DC3 | Twin-prop / vintage |
| `e195.svg` | E195 | Embraer 195 |
| `erj.svg` | ERJ | Regional jet (Embraer/CRJ/biz jets) |
| `helicopter.svg` | Helicopter | Generic helicopter |
| `conc.svg` | Conc | Concorde |

**Aircraft Type → Icon Mapping (ported from FSTrAk `AircraftResolver.cs`):**

The resolver matches ICAO type codes from the VATSIM data feed against candidate lists. First match wins. Matching uses `code.includes(candidate)` (same as current VatView logic).

| Icon Key | Scale | Code Candidates |
|---|---|---|
| B737 | 0.75 | B737, B738, B739, B733, B734, B735, B736, B38M, B39M, B3XM |
| A320 | 0.75 | A318, A319, A320, A321, A20N, A21N, T204 |
| C172 | 0.6 | C172, C82R, C140, C170, C210, C182, C177, PA28, P28A, P28R, P28B, P28T, DA20, DA40, SR22, COY2 |
| B747 | 1.1 | B741, B742, B743, B744, B748, B74R, B74S |
| B767 | 0.8 | B762, B763, B764 |
| B777 | 1.0 | B772, B773, B778, B779, B77X, B77L, B77W |
| B787 | 0.9 | B788, B789, B78X |
| A340 | 1.0 | A342, A343, A345, A346, A347, IL76, IL96 |
| A330 | 1.0 | A332, A333, A339, A310, A306, A300, A33X, A33Y, A359, A35K |
| A380 | 1.2 | A388 |
| ERJ | 0.6 | E175, E190, E170, E195, CRJ, CJ2, CJ3, CRJ9, CRJ7, CJ4, C500, C510, C525, C550, C560, CL30, CL60, C25C, GLF5, LJ35, T154, T134, F28, E50P |
| DC3 | 0.6 | DC3, C47, DC2, PA34, B300, B200, B350, C310 |
| Helicopter | 0.6 | B06, H500, H135, EC45, EC35, H145, H160, H155, H125, H275, R44, B47G, R66, B212, UH1 |
| Conc | 1.3 | CONC |

**Fallback logic:** If no code matches, default to B737 at scale 0.75 (same as current VatView behavior).

**Changes from current `iconsHelper.js`:**
- **Added 6 types:** B767, DC3, ERJ, E195, Helicopter, Conc
- **Removed F100** — regional jets now map to ERJ
- **Expanded code lists** — significantly more ICAO type codes covered per icon (e.g., GA codes now include Piper, Diamond, Cirrus)
- **Scale factors replace fixed pixel sizes** — relative scaling (0.6–1.3) instead of hardcoded dp values (16–32px). Base size TBD during implementation based on map zoom level

### Zoom-Aware Airport Markers

**Decision:** Airport markers render differently at three zoom bands for performance and progressive information density.

**Rationale:** At continental/regional zoom, potentially hundreds of airports are visible. Image markers (simple bitmaps) ensure 60fps panning. At local zoom, fewer airports are on screen, allowing View-based markers with full ATC badge layout.

**Implementation:**
- `MapComponent.jsx` provides current zoom level via `onRegionChangeComplete` callback
- `AirportMarkers.jsx` receives zoom level and conditionally renders:

| Zoom Band | Zoom Level | Display | Marker Type |
|---|---|---|---|
| Continental | 3–4 | Staffed only: small dot + ICAO at 8px | Image marker |
| Regional | 5–6 | Staffed: dot + ICAO at 11px. Unstaffed: grey dot, no label | Image marker |
| Local | 7+ | Full: dot + ICAO + ATC letter badges (C/G/T/A) + traffic count arrows (▲/▼) | View-based marker |

- ATC letter badges: C (grey/Clearance), G (green/Ground), T (amber/Tower), A (blue/Approach), A (cyan/ATIS)
- Traffic counts: green ▲ departures, red ▼ arrivals
- **Affects:** MapComponent.jsx (zoom callback), AirportMarkers.jsx (complete redesign)

### Animation Token System

**Decision:** Standardized animation tokens defined in `tailwind.config.js` and used consistently across all animated transitions.

**Rationale:** The UX spec defines specific timing and easing for the "instrument, not toy" feel. All animations must be consistent and must respect the system "Reduce Motion" accessibility setting.

**Implementation:**
- Animation tokens in `tailwind.config.js`:
  - `duration.fast`: 150ms — micro-interactions (chip toggle, state changes)
  - `duration.normal`: 250ms — panel transitions, tab switches
  - `duration.slow`: 400ms — sheet open/close, layout morphs
  - `easing.default`: `cubic-bezier(0.2, 0, 0, 1)` — smooth deceleration, no bounce
  - `spring.sheet`: `{ damping: 20, stiffness: 300 }` — bottom sheet gesture physics
- Reduced motion: All `duration.*` tokens resolve to 0ms when `AccessibilityInfo.isReduceMotionEnabled()` returns true. Wrap `withSpring`/`withTiming` calls in a reduced-motion check.
- **Affects:** Every animated component (sheet, nav island, filter chips, tab transitions)

### Tab Cross-Fade Transitions

**Decision:** Tab switches via NavIsland use cross-fade animation (250ms `duration.normal`), not hard cuts.

**Rationale:** The UX spec requires map-fade animations when switching tabs to maintain spatial continuity. Hard cuts break the perception that "the map is always there."

**Implementation:**
- Custom tab transition using React Navigation's `animation` config or a fade wrapper in `MainTabNavigator`
- Duration: `duration.normal` (250ms) cross-fade between outgoing and incoming views
- The map tab should feel like it's "always underneath" other tabs
- **Affects:** MainTabNavigator.jsx

### Accessibility Architecture

**Decision:** WCAG 2.1 AA compliance built into all Phase 1 components.

**Rationale:** Accessibility is not optional per the UX spec — it ships with Phase 1. Screen reader support, reduced motion, and contrast ratios are hard requirements.

**Implementation:**
- Every interactive element gets an `accessibilityLabel` — no exceptions
- Use `accessibilityRole` appropriately: `button` for tappable elements, `tab` for NavIsland items, `adjustable` for the sheet, `image` for map markers
- Reduced motion: `AccessibilityInfo.isReduceMotionEnabled()` check — all animations skip to final state when enabled
- Touch targets: 44x44px minimum for all interactive elements. Map markers have expanded hit areas beyond visual bounds
- Color-independent indicators: ATC badges use letter + color, StaleIndicator uses color + pulse, polygons distinguishable by shape
- Screen reader navigation order on map: NavIsland → filter chips → StaleIndicator → map markers → DetailSheet
- **Affects:** Every component (accessibility labels), animation system (reduced motion), MapOverlayGroup (focus order)

### Decision Impact Analysis

**Implementation Sequence Dependencies:**

```
theme.js (tokens) → tailwind.config.js → NativeWind setup
                  → ThemeContext
                  → BlurWrapper → TranslucentSurface
                               → FloatingNavIsland
                               → DetailPanelProvider → Detail views
                               → FloatingFilterChips
                  → AircraftIconService → PilotMarkers
                  → MapOverlayGroup → coordinates all floating elements
                  → Map screen (full-bleed + HUD)
```

**Cross-Component Dependencies:**
- BlurWrapper depends on `Platform.OS` (no context needed)
- TranslucentSurface depends on BlurWrapper
- ThemedText, ListItem — zero dependencies (build first)
- FloatingNavIsland depends on TranslucentSurface + ThemeContext
- DetailPanelProvider depends on TranslucentSurface + ThemeContext + orientation detection
- MapOverlayGroup depends on FloatingNavIsland + FloatingFilterChips + DetailPanelProvider + StaleIndicator
- AircraftIconService depends on ThemeContext (regenerates cache on theme change)
- AirportMarkers depends on zoom level from MapComponent
- All detail views depend on DetailPanelProvider (disclosure level API)
- Map screen depends on MapOverlayGroup (which orchestrates all floating elements) + ThemeContext (map style)
- Every migrated component depends on NativeWind config + theme tokens being in place

## Implementation Patterns & Consistency Rules

_These patterns supplement the existing rules in `project-context.md`. They cover new patterns introduced by the Phase 1 UI migration. All existing project-context rules remain in effect._

### NativeWind Class Patterns

**Class ordering convention (Tailwind standard order):**
Layout → Sizing → Spacing → Typography → Visual → State variants

```jsx
// Correct
className="flex-1 w-full px-4 py-2 text-base font-medium bg-white/45 rounded-2xl dark:bg-black/45"

// Wrong — random ordering
className="dark:bg-black/45 px-4 font-medium flex-1 bg-white/45 rounded-2xl w-full py-2 text-base"
```

**NativeWind vs StyleSheet boundary rules:**

| Use NativeWind (`className`) | Use StyleSheet.create() |
|---|---|
| All new UI components | `@gorhom/bottom-sheet` container props (`style`, `backgroundStyle`, `handleStyle`) |
| Content inside bottom sheet | `react-native-maps` `Marker` and `Polygon` style props |
| Floating nav island content | Any component with `position: 'absolute'` that overlays the map (use StyleSheet for positioning, NativeWind for visual styling) |
| Filter chips content | Reanimated `useAnimatedStyle()` outputs — go directly to `style` prop, never NativeWind classes |
| All text, buttons, cards, lists | Styles that must be computed dynamically from Reanimated shared values |

**Rule:** If a third-party library component does not accept `className`, use StyleSheet. Wrap it in a `View` with NativeWind classes for visual styling.

**Reanimated animation rule:** Never use NativeWind classes for animated transitions (e.g., `className={isVisible ? 'opacity-100' : 'opacity-0'}`). Use Reanimated `useAnimatedStyle()` with shared values for smooth animations (e.g., FloatingNavIsland auto-hide fade).

### Theme Token Patterns

**Never hardcode colors. Never use NativeWind default palette colors.**

```jsx
// Correct — custom token from tailwind.config.js
className="bg-surface dark:bg-surface-dark text-on-surface"

// Wrong — NativeWind default
className="bg-gray-100 dark:bg-gray-900 text-gray-800"

// Wrong — hardcoded
style={{ backgroundColor: '#f5f5f5' }}
```

**Accessing theme values outside NativeWind (e.g., for Maps, dynamic styles):**

```jsx
// Correct — use ThemeContext
const { activeMapStyle, isDark } = useTheme();
<MapView customMapStyle={activeMapStyle} />

// Wrong — import map style directly
import { blueGreyMapStyle } from '../../common/theme';
```

### Blur & Translucency Patterns

**Always use BlurWrapper. Never import expo-blur directly in feature components.**

```jsx
// Correct
import BlurWrapper from '../../common/BlurWrapper';
<BlurWrapper intensity={45}>
  <View className="px-4 py-2">...</View>
</BlurWrapper>

// Wrong — bypasses fallback logic
import { BlurView } from 'expo-blur';
<BlurView intensity={45}>...</BlurView>
```

**Standard translucency values (from UX spec design tokens):**
- Floating surfaces (nav island, filter chips): `opacity="surface"` (0.45), iOS blur `intensity={20}`
- Detail panel at half: `opacity="surface-dense"` (0.65)
- Detail panel at full / non-map screens: `opacity="overlay"` (0.85)
- Android always uses solid translucency at these opacity values + 1px border + elevation shadow
- iOS uses backdrop blur at these opacity values
- These values are defaults in BlurWrapper — only override with explicit rationale

### Detail Panel Provider Patterns

**Always use the provider API. Never access bottom sheet refs directly from detail views.**

```jsx
// Correct — in a detail view component
const { close } = useDetailPanel();
return (
  <PilotDetailCard client={client} />
);
// The sheet snap points control how much of the card is visible — no conditional rendering needed

// Wrong — reaching into bottom sheet directly
const bottomSheetRef = useRef();
bottomSheetRef.current.snapToIndex(1);
```

**Single-card content model:**
- Each detail type renders a single complete card with ALL content, ordered by information priority (most glanceable at top, full detail at bottom)
- The sheet snap points (peek/half/full) control how much of the card is physically visible — no conditional rendering
- Each detail type has one card component: `PilotDetailCard`, `AtcDetailCard`, `CtrDetailCard`, `AirportDetailCard`

**Content Priority Order (implementation contract):**

| Detail Type | Card Top (visible at peek) | Card Middle (visible at half) | Card Bottom (visible at full) |
|---|---|---|---|
| Pilot | Callsign, aircraft type, dep→arr, altitude, groundspeed | Route summary, heading, distance remaining, time enroute | Full flight plan text, transponder, server info, remarks, time online, rating |
| ATC (airport) | Callsign, frequency, facility type, ATIS indicator | Controller rating, logon time, ATIS summary | Full ATIS text, remarks, sector coverage detail |
| CTR | Callsign, frequency, sector name | Rating, logon time, list of all controllers in FIR | Full ATIS text, coverage area detail, ATC bookings |
| Airport ATC | Airport name, # positions staffed, ATC badges, traffic counts | List of staffed positions with frequencies | Individual controller details, METAR link, ATC bookings, full traffic board |

### Navigation Island Patterns

**Tab switching always goes through React Navigation.**

```jsx
// Correct
const navigation = useNavigation();
navigation.navigate('Map');

// Wrong — manipulating tab state directly
dispatch(appActions.setActiveTab('Map'));
```

### New Component File Placement

| Component | Location | Rationale |
|---|---|---|
| BlurWrapper | `app/common/BlurWrapper.jsx` | Shared utility, same level as theme.js |
| AircraftIconService | `app/common/aircraftIconService.js` | Shared utility — SVG→bitmap pipeline for pilot markers |
| ThemeContext / ThemeProvider | `app/common/ThemeProvider.jsx` | App-wide context provider |
| TranslucentSurface | `app/components/shared/TranslucentSurface.jsx` | Base wrapper for all floating elements (uses BlurWrapper) |
| ThemedText | `app/components/shared/ThemedText.jsx` | Typography with 9 variants (system sans + JetBrains Mono) |
| ListItem | `app/components/shared/ListItem.jsx` | Shared list item base (64px min, left/body/trailing slots) |
| StaleIndicator | `app/components/shared/StaleIndicator.jsx` | Data freshness dot (green/amber/red with pulse) |
| ThemePicker | `app/components/shared/ThemePicker.jsx` | System/Dark/Light selector for Settings |
| FloatingNavIsland | `app/components/navigation/FloatingNavIsland.jsx` | New navigation feature component |
| MapOverlayGroup | `app/components/mapOverlay/MapOverlayGroup.jsx` | Layout orchestrator for all floating map elements |
| FloatingFilterChips | `app/components/filterBar/FloatingFilterChips.jsx` | Replaces/augments existing FilterBar |
| DetailPanelProvider | `app/components/detailPanel/DetailPanelProvider.jsx` | New abstraction for detail views |
| PilotDetailCard, AtcDetailCard, CtrDetailCard, AirportDetailCard | `app/components/clientDetails/` | Co-located with the detail view that owns them |

**Provider import rule:** Providers (`DetailPanelProvider`, `ThemeProvider`) can be imported by any component across directories. Feature components should NOT import from sibling feature directories except for providers.

### Migration Process Patterns

**Per-component migration checklist:**
1. Create NativeWind version of the component alongside the existing one (if large) or edit in place (if small)
2. Replace all `react-native-paper` imports with NativeWind equivalents or plain React Native components
3. Replace all `StyleSheet.create()` visual styles with NativeWind classes (keep layout StyleSheet for absolute positioning)
4. Replace all `theme.colors.*` references with NativeWind token classes
5. Verify no hardcoded colors remain (`npm run lint` catches this)
6. Per-component migration tests (see below)
7. Remove old Paper-specific StyleSheet entries

**Per-component migration test checklist:**
1. **Translucency:** Blur/translucent surfaces render correctly (not opaque, not invisible) on both platforms
2. **Theme switching:** Component renders correctly in both light and dark themes; no stale colors after toggle
3. **Text overflow:** No overflow or clipping at different text lengths (callsigns vary wildly — `N123` vs `SPEEDBIRD2948`)
4. **Map gesture pass-through:** If the component overlays the map, verify map gestures (pan, zoom, tap) still work through/around it

**react-native-paper removal rule:** Paper can only be fully uninstalled from `package.json` after ALL 28 components are migrated (step 10 in the migration order). During migration, both NativeWind and Paper coexist.

### Enforcement Guidelines

**All AI agents MUST:**
- Read `project-context.md` AND this architecture document before implementing any migration story
- Use `npm run lint` after every component migration — ESLint catches hardcoded colors and inline styles
- Never import from `react-native-paper` in a component that has been marked as migrated
- Never import `expo-blur` directly — always use `BlurWrapper` (or `TranslucentSurface` which wraps it)
- Never access `@gorhom/bottom-sheet` refs from detail view components — always use `DetailPanelProvider`
- Use single complete card per detail type — sheet snap points control visibility, no conditional content rendering
- Use custom theme tokens from `tailwind.config.js`, never NativeWind defaults
- Use Reanimated `useAnimatedStyle()` for animations, never NativeWind class toggling
- Use animation duration tokens (`duration.fast`/`normal`/`slow`) — never hardcode timing values
- Wrap all `withSpring`/`withTiming` calls in reduced-motion check (`AccessibilityInfo.isReduceMotionEnabled()`)
- Add `accessibilityLabel` and `accessibilityRole` to every interactive element — no exceptions
- Ensure all touch targets meet 44x44px minimum (expand hit areas for map markers)
- Use JetBrains Mono (`font-mono`) for all aviation data: callsigns, frequencies, ICAO codes, flight plan strings
- Position all floating map elements through `MapOverlayGroup` — never position them independently

### Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| `import { Button } from 'react-native-paper'` in migrated component | Paper is being removed | Use NativeWind-styled `Pressable` or `TouchableOpacity` |
| `className="bg-blue-500"` | Uses NativeWind default palette, not project tokens | `className="bg-primary"` (custom token) |
| `<BlurView>` in a feature component | Bypasses fallback logic | `<BlurWrapper>` |
| `bottomSheetRef.current.snapToIndex(2)` in PilotDetails | Breaks detail panel abstraction | `useDetailPanel()` API |
| Conditional rendering based on disclosure level | Unnecessary complexity — sheet snap points handle visibility | Single complete card, no conditional rendering |
| `style={{ position: 'absolute', bottom: 20 }}` on FloatingNavIsland | Inline styles violate ESLint | StyleSheet.create() for positioning |
| `className={isVisible ? 'opacity-100' : 'opacity-0'}` for animations | Discrete class swaps, not smooth transitions | Reanimated `useAnimatedStyle()` with shared values |
| `import PilotDetails from '../clientDetails/PilotDetails'` in AirportView | Feature components importing from sibling feature dirs | Only import providers cross-directory |
| `withTiming(value, { duration: 250 })` | Hardcoded duration, ignores reduced motion | Use `duration.normal` token + reduced-motion wrapper |
| `<BlurView>` on Android | Android blur can't reliably hit 60fps across overlapping surfaces | `BlurWrapper` renders solid translucency on Android (permanent design decision) |
| Interactive element without `accessibilityLabel` | Screen reader users can't identify the element | Always add `accessibilityLabel` and `accessibilityRole` |
| Positioning FloatingNavIsland directly in VatsimMapView | Bypasses coordinated layout orchestration | Position through `MapOverlayGroup` |

## Project Structure & Boundaries

### Complete Project Directory Structure

Existing structure preserved. **New files/directories marked with ➕**. Modified files marked with ✏️.

```
VatView/
├── App.js                                    ✏️ Add ThemeProvider wrapping, bundle JetBrains Mono font
├── index.js
├── app.json
├── eas.json
├── package.json                              ✏️ Add nativewind, tailwindcss, expo-blur, expo-screen-orientation
├── babel.config.js                           ✏️ Add NativeWind Babel plugin
├── metro.config.js                           ✏️ Wrap with withNativeWind()
├── tailwind.config.js                        ➕ NativeWind preset, content paths, custom theme tokens
├── global.css                                ➕ Tailwind directives (@tailwind base/components/utilities)
├── .eslintrc.json
├── CLAUDE.md
│
├── app/
│   ├── common/
│   │   ├── theme.js                          ✏️ Export lightTheme, darkTheme, lightMapStyle, darkMapStyle, tailwind tokens
│   │   ├── consts.js
│   │   ├── staticDataAcessLayer.js
│   │   ├── storageService.js
│   │   ├── boundaryService.js
│   │   ├── iconsHelper.js
│   │   ├── airportTools.js
│   │   ├── metarTools.js
│   │   ├── createKey.js
│   │   ├── BlurWrapper.jsx                   ➕ Reusable blur (iOS) / solid translucency (Android) component
│   │   ├── aircraftIconService.js            ➕ SVG→bitmap pipeline for aircraft markers (replaces iconsHelper.js)
│   │   └── ThemeProvider.jsx                 ➕ ThemeContext: map style, isDark, toggleTheme, preference
│   │
│   ├── components/
│   │   ├── mainApp/
│   │   │   ├── MainApp.jsx                   ✏️ Remove Paper AppBar, integrate floating HUD
│   │   │   └── MainTabNavigator.jsx          ✏️ tabBarStyle: { display: 'none' }
│   │   │
│   │   ├── navigation/                       ➕ New directory
│   │   │   └── FloatingNavIsland.jsx         ➕ Translucent floating tab pill
│   │   │
│   │   ├── mapOverlay/                       ➕ New directory
│   │   │   └── MapOverlayGroup.jsx           ➕ Layout orchestrator for all floating map elements
│   │   │
│   │   ├── detailPanel/                      ➕ New directory
│   │   │   └── DetailPanelProvider.jsx       ➕ Bottom sheet / side panel abstraction
│   │   │
│   │   ├── vatsimMapView/
│   │   │   ├── VatsimMapView.jsx             ✏️ Full-bleed map, wrap with DetailPanelProvider
│   │   │   ├── MapComponent.jsx              ✏️ Theme-aware customMapStyle from ThemeContext
│   │   │   ├── PilotMarkers.jsx              ✏️ Use AircraftIconService for marker images
│   │   │   ├── AirportMarkers.jsx            ✏️ Zoom-aware rendering (3 bands: continental/regional/local)
│   │   │   └── CTRPolygons.jsx               ✏️ NativeWind migration (StyleSheet for Polygon styles)
│   │   │
│   │   ├── clientDetails/
│   │   │   ├── ClientDetails.jsx             ✏️ Use DetailPanelProvider API, route by client type
│   │   │   ├── PilotDetails.jsx              ✏️ Renders PilotDetailCard unconditionally
│   │   │   ├── PilotDetailCard.jsx           ➕ Single complete pilot detail card (content ordered by priority)
│   │   │   ├── AtcDetails.jsx                ✏️ Renders AtcDetailCard unconditionally
│   │   │   ├── AtcDetailCard.jsx             ➕ Single complete ATC detail card
│   │   │   ├── CtrDetails.jsx                ✏️ Renders CtrDetailCard unconditionally
│   │   │   ├── CtrDetailCard.jsx             ➕ Single complete CTR detail card
│   │   │   ├── AirportAtcDetails.jsx         ✏️ Renders AirportDetailCard unconditionally
│   │   │   ├── AirportDetailCard.jsx         ➕ Single complete airport detail card
│   │   │   └── (PilotLevel1Summary, PilotLevel2Details, PilotLevel3Full removed by 4.2.1)
│   │   │
│   │   ├── shared/                           ➕ New directory — shared UI building blocks
│   │   │   ├── TranslucentSurface.jsx        ➕ Base wrapper for all floating elements (uses BlurWrapper)
│   │   │   ├── ThemedText.jsx                ➕ Typography with 9 variants (system sans + JetBrains Mono)
│   │   │   ├── ListItem.jsx                  ➕ Shared list item base (64px min, left/body/trailing slots)
│   │   │   ├── StaleIndicator.jsx            ➕ Data freshness dot (green/amber/red with pulse)
│   │   │   └── ThemePicker.jsx               ➕ System/Dark/Light selector for Settings
│   │   │
│   │   ├── filterBar/
│   │   │   ├── FilterBar.jsx                 ✏️ NativeWind migration (may be replaced by FloatingFilterChips)
│   │   │   └── FloatingFilterChips.jsx       ➕ Translucent floating filter toggles
│   │   │
│   │   ├── airportView/
│   │   │   ├── AirportDetailsView.jsx        ✏️ NativeWind migration
│   │   │   ├── AirportSearchList.jsx         ✏️ NativeWind migration
│   │   │   └── AirportListItem.jsx           ✏️ NativeWind migration
│   │   │
│   │   ├── vatsimListView/
│   │   │   └── VatsimListView.jsx            ✏️ NativeWind migration
│   │   │
│   │   ├── EventsView/
│   │   │   ├── VatsimEventsView.jsx          ✏️ NativeWind migration
│   │   │   ├── EventListItem.jsx             ✏️ NativeWind migration
│   │   │   └── EventDetailsView.jsx          ✏️ NativeWind migration
│   │   │
│   │   ├── BookingsView/
│   │   │   ├── BookingsView.jsx              ✏️ NativeWind migration
│   │   │   └── BookingDeatils.jsx            ✏️ NativeWind migration
│   │   │
│   │   ├── MetarView/
│   │   │   └── MetarView.jsx                 ✏️ NativeWind migration
│   │   │
│   │   ├── settings/
│   │   │   └── Settings.jsx                  ✏️ NativeWind migration + theme toggle UI
│   │   │
│   │   ├── About/
│   │   │   └── About.jsx                     ✏️ NativeWind migration
│   │   │
│   │   ├── networkStatus/
│   │   │   └── networkStatus.jsx             ✏️ NativeWind migration
│   │   │
│   │   └── LoadingView/
│   │       └── LoadingView.jsx               ✏️ NativeWind migration
│   │
│   └── redux/                                (unchanged — no Redux modifications in Phase 1)
│       ├── actions/
│       │   ├── index.js
│       │   ├── appActions.js
│       │   ├── vatsimLiveDataActions.js
│       │   ├── staticAirspaceDataActions.js
│       │   └── metarActions.js
│       └── reducers/
│           ├── rootReducer.js
│           ├── appReducer.js
│           ├── vatsimLiveDataReducer.js
│           ├── staticAirspaceDataReducer.js
│           └── metarReducer.js
│
├── assets/                                   (unchanged)
│   ├── aircraft/blue-2A5D99/
│   ├── atc/
│   └── ...
│
└── docs/                                     (unchanged)
```

### Architectural Boundaries

**Provider Hierarchy (App.js wrapping order):**

```
<ThemeProvider>                      ← theme context (isDark, mapStyle, toggle)
  <Provider store={store}>           ← Redux store (existing)
    <NavigationContainer>            ← React Navigation (existing)
      <MainApp />
    </NavigationContainer>
  </Provider>
</ThemeProvider>
```

**Note:** No `PlatformCapabilityProvider` needed — blur vs solid translucency is a simple `Platform.OS` check inside `BlurWrapper`, not a runtime capability detection.

**Component Communication Boundaries:**

| Boundary | Direction | Mechanism |
|---|---|---|
| Components → Redux | Read | `useSelector(state => state.<slice>)` |
| Components → Redux | Write | `useDispatch()` + `allActions.<module>.<action>()` |
| Components → Theme | Read | NativeWind `dark:` classes (automatic) |
| Components → Map Style | Read | `useTheme()` → `activeMapStyle` |
| Components → Blur/Translucency | Read | `BlurWrapper` (checks `Platform.OS` internally) |
| Detail Views → Panel Container | Read/Write | `useDetailPanel()` → `open()`, `close()`, `selectedClient` |
| FloatingNavIsland → Navigation | Write | `useNavigation()` → `navigate()` |
| Map ← Data Pipeline | Read | `useSelector` for pilots, controllers, boundaries (every 20s) |

**Data Boundaries (unchanged from current architecture):**

| Boundary | Technology | Access Pattern |
|---|---|---|
| Live VATSIM data | Redux `vatsimLiveData` slice | Polled every 20s via thunk → `useSelector` |
| Static airports | SQLite via `staticDataAcessLayer.js` | Read-only after initial population |
| FIR/TRACON boundaries | In-memory lookups in Redux `staticAirspaceData` | Parsed from GeoJSON on cold start |
| Map region, preferences | AsyncStorage | Read on startup, write on change |
| Theme preference | AsyncStorage (new) | Read on startup by ThemeProvider, write on toggle |

### Requirements to Structure Mapping

| FR Category | Primary Files | New Files |
|---|---|---|
| **Map Experience** (FR1-8) | `VatsimMapView.jsx`, `MapComponent.jsx`, `PilotMarkers.jsx`, `AirportMarkers.jsx`, `CTRPolygons.jsx` | `FloatingNavIsland.jsx`, `FloatingFilterChips.jsx`, `DetailPanelProvider.jsx`, `MapOverlayGroup.jsx`, `aircraftIconService.js`, `TranslucentSurface.jsx`, `StaleIndicator.jsx` |
| **Progressive Disclosure** (FR9-11, FR11a) | `ClientDetails.jsx`, `PilotDetails.jsx`, `AtcDetails.jsx`, `CtrDetails.jsx`, `AirportAtcDetails.jsx` | 5 detail card components (`PilotDetailCard`, `AtcDetailCard`, `CtrDetailCard`, `AirportDetailCard`, plus airport view card) |
| **Navigation** (FR12-14) | `MainTabNavigator.jsx`, `MainApp.jsx` | `FloatingNavIsland.jsx` |
| **Filtering** (FR15-18) | `FilterBar.jsx`, `VatsimListView.jsx`, `AirportDetailsView.jsx` | `FloatingFilterChips.jsx` |
| **Theming** (FR29-33) | `theme.js`, `App.js` | `ThemeProvider.jsx`, `tailwind.config.js`, `global.css`, `lightMapStyle`/`darkMapStyle` in theme.js |
| **Orientation** (FR34-37) | `VatsimMapView.jsx` | `DetailPanelProvider.jsx` (orientation-aware container switching) |
| **Settings** (FR38) | `Settings.jsx` | Theme toggle UI added to Settings |
| **Blur/Translucency** (NFR4, FR33) | — | `BlurWrapper.jsx`, `TranslucentSurface.jsx` |
| **Typography** (UX spec) | — | `ThemedText.jsx`, JetBrains Mono font bundle |
| **Shared UI** (UX spec) | — | `ListItem.jsx`, `StaleIndicator.jsx`, `ThemePicker.jsx` |
| **Accessibility** (UX spec, WCAG 2.1 AA) | All interactive components | Accessibility labels, reduced motion, 44px touch targets |

### Cross-Cutting Concern Locations

| Concern | Files |
|---|---|
| Theme tokens | `theme.js` → `tailwind.config.js` → every component via NativeWind classes |
| Blur rendering | `BlurWrapper.jsx` → TranslucentSurface → FloatingNavIsland, DetailPanelProvider, FloatingFilterChips |
| Progressive disclosure | `DetailPanelProvider.jsx` → all 5 detail views → 5 detail card components |
| Migration coexistence | All 28 components during migration; `package.json` retains `react-native-paper` until step 10 |
| Map performance | `MapComponent.jsx`, `PilotMarkers.jsx`, `CTRPolygons.jsx` — no new performance concerns from overlay components (they render outside the map's child tree) |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices verified compatible: NativeWind v4.2.2 + Expo SDK 55 + Reanimated v4 (via v4.2.0+ patch), expo-blur + SDK 55 RenderNode API, NativeWind + @gorhom/bottom-sheet v5 (known limitation documented and accounted for). ThemeProvider + NativeWind `dark:` variants are complementary. No contradictory decisions found.

**Pattern Consistency:**
NativeWind vs StyleSheet boundary clearly defined with decision table. Reanimated animation rule prevents class-toggling conflicts. Theme token enforcement prevents palette drift. Provider import rule prevents spaghetti dependencies. All patterns use VatView-specific examples.

**Structure Alignment:**
New files placed consistently with existing conventions (PascalCase .jsx, utilities in `app/common/`). Provider hierarchy in App.js logically ordered. No circular dependencies in component graph.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage: 43/43 FRs covered**

| FR Range | Status | Architectural Support |
|---|---|---|
| FR1-8 (Map Experience) | ✅ | Full-bleed map, FloatingNavIsland, DetailPanelProvider, marker components |
| FR9-11, FR11a (Progressive Disclosure) | ✅ | DetailPanelProvider snap points, 5 detail card components, single-card pattern |
| FR12-14 (Navigation) | ✅ | FloatingNavIsland + hidden tab bar |
| FR15-18 (Filtering/Search) | ✅ | FloatingFilterChips + existing search in list/airport views |
| FR19-20 (Client List) | ✅ | VatsimListView NativeWind migration |
| FR21-23 (Airport View) | ✅ | AirportDetailsView migration + progressive disclosure |
| FR24-27 (Events/Bookings) | ✅ | Events + Bookings views NativeWind migration |
| FR28 (Weather) | ✅ | MetarView NativeWind migration |
| FR29-33 (Theming) | ✅ | ThemeProvider, NativeWind dark: variants, dual map styles, BlurWrapper |
| FR34-37 (Orientation) | ✅ | DetailPanelProvider orientation-aware (landscape deferred, abstraction ready) |
| FR38 (Settings) | ✅ | Theme toggle in Settings |
| FR39-42 (Network/Data) | ✅ | Redux pipeline unchanged |
| FR43 (Feature Parity) | ✅ | All 28 components in migration order |

**Non-Functional Requirements Coverage: 17/17 NFRs covered**

| NFR | Status | Architectural Support |
|---|---|---|
| NFR1-3 (Performance) | ✅ | Overlay components outside map child tree; Reanimated for animations |
| NFR4 (Blur fallback) | ✅ | BlurWrapper: iOS native blur, Android solid translucency (permanent platform design) |
| NFR5 (Orientation transition) | ✅ | DetailPanelProvider via useWindowDimensions |
| NFR6 (Theme no restart) | ✅ | React context + NativeWind dark: — instant |
| NFR7 (Cold start) | ✅ | No new startup overhead — BlurWrapper uses `Platform.OS` (no async check) |
| NFR8-11 (Integration) | ✅ | Existing error handling preserved; Maps styling fallback documented |
| NFR12-14 (Compatibility) | ✅ | NativeWind/StyleSheet coexistence defined; third-party lib boundaries documented |
| NFR15-17 (Visual quality) | ✅ | Token enforcement, no hardcoded colors, dual map styling |

### Implementation Readiness Validation ✅

**Decision Completeness:** All 6 critical decisions documented with rationale, implementation details, affected components, and verified library versions.

**Structure Completeness:** Every new file has a specific location and rationale. Every existing file that needs modification is marked. Provider hierarchy explicitly defined.

**Pattern Completeness:** NativeWind class ordering, boundary rules, theme tokens, blur wrapper, detail panel, navigation, file placement, migration process — all with examples and anti-patterns. Disclosure content mapping table defines what goes at each level for each detail type.

### Gap Analysis Results

**Critical Gaps: None**

**Important Gaps (non-blocking, address during implementation):**

1. **Google Maps dark theme JSON** — Architecture specifies two map style sets but doesn't define the dark theme JSON rules. Current `blueGreyMapStyle` (37 rules) serves as light theme baseline. **Resolution:** Create during migration step 2 (theme system). UX spec provides guidance: deep navy/charcoal base, subtle road lines, muted labels, optimized for polygon and marker contrast.

2. **ClusteredPilotMarkers status** — Listed as "in-progress" in docs. Not in PRD scope. **Resolution:** Continue as-is, migrate when reached in step 5.

3. **react-native-paper replacement mapping** — Architecture says "replace Paper components" but doesn't list specific Paper→NativeWind equivalents. **Resolution:** Each migration story identifies Paper components in the target file and documents the replacement (Paper `Button` → `Pressable` + NativeWind, Paper `Text` → RN `Text` + NativeWind/ThemedText, Paper `Surface` → `View` + NativeWind/TranslucentSurface).

4. **FSTrAk SVG assets** — AircraftIconService depends on SVG assets from the FSTrAk project (provided by Oren). **Resolution:** Coordinate asset delivery before migration step 5 (map screen).

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (43 FRs, 17 NFRs)
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (10 constraints)
- [x] Cross-cutting concerns mapped (7 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (6 decisions)
- [x] Technology stack fully specified (NativeWind 4.2.2, expo-blur SDK 55, etc.)
- [x] Integration patterns defined (provider hierarchy, communication boundaries)
- [x] Performance considerations addressed (blur fallback, map overlay separation)

**✅ Implementation Patterns**
- [x] Naming conventions established (NativeWind class ordering, file naming)
- [x] Structure patterns defined (NativeWind vs StyleSheet boundary, file placement)
- [x] Communication patterns specified (provider APIs, Redux, navigation)
- [x] Process patterns documented (migration checklist, test checklist, anti-patterns)

**✅ Project Structure**
- [x] Complete directory structure defined (new + modified files annotated)
- [x] Component boundaries established (provider hierarchy, import rules)
- [x] Integration points mapped (communication boundary table)
- [x] Requirements to structure mapping complete (FR → file mapping)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Brownfield-aware — preserves all existing architecture, only adds UI layer
- Low-risk navigation approach (hidden tab bar, not custom navigator)
- DetailPanelProvider abstraction future-proofs for landscape without over-building
- Clear migration order with testable incremental steps
- Comprehensive anti-pattern documentation prevents common agent mistakes
- All 43 FRs and 17 NFRs have explicit architectural support

**Areas for Future Enhancement:**
- Dark theme Google Maps JSON (create during theme system implementation)
- Paper component replacement mapping (document per-story)
- Landscape side panel implementation (abstraction ready, container deferred)
- Phase 2 aviation theme token structure (extensible, not yet designed)
- Dynamic opacity strategy — UX spec mentions increasing surface opacity when map is visually noisy (not yet specified how to detect "noisy" map state)

### Implementation Handoff

**First implementation priority:**

```bash
# Step 1: Install dependencies and configure NativeWind
npm install nativewind@^4.2.2 tailwindcss@^3.4.0
npx expo install expo-blur expo-screen-orientation
# Then: create tailwind.config.js, update babel.config.js, metro.config.js, add global.css
```

**AI Agent Guidelines:**
- Read `project-context.md` AND this architecture document before any implementation
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
