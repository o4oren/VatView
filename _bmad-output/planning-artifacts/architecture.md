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
- **Progressive disclosure system** (FR9-11): Three-level information hierarchy (glanceable → tap → pull up). Requires a component architecture that supports collapsible content sections with consistent behavior across pilot, ATC, and airport detail views. **Design dependency:** 5 detail view types (pilot, ATC, CTR, airport ATC, airport) × 3 disclosure levels = 15 distinct view states that must be designed before progressive disclosure components can be built.
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
- Estimated architectural components: ~35 (28 existing restyled + new floating nav island, theme provider, adaptive layout container, blur wrapper, filter chips overlay, detail panel abstraction, and design token system)

### Technical Constraints & Dependencies

| Constraint | Impact | Source |
|---|---|---|
| No TypeScript | Component contracts must be maintained through conventions and project-context rules, not types | Project rule |
| No Redux Toolkit | State management stays as-is — no store migration | Project rule |
| react-native-paper removal | Every component using Paper (all 28) must be restyled | PRD FR1-8, FR43 |
| NativeWind + react-native-maps compatibility | Unknown — must validate before committing to NativeWind for map overlay components | PRD risk table |
| NativeWind + @gorhom/bottom-sheet compatibility | Unknown — must validate before committing to NativeWind for bottom sheet | PRD risk table |
| Backdrop blur device support | Must support graceful fallback to solid semi-transparent backgrounds | NFR4 |
| Google Maps custom styling | Two complete JSON style sets needed (light + dark), managed separately from NativeWind tokens | FR32 |
| Expo SDK 55 | Determines available NativeWind version and native module compatibility | Current stack |
| Solo developer + AI-assisted | Migration strategy should favor incremental, testable steps over big-bang | Product brief |
| @gorhom/bottom-sheet has no side panel mode | Landscape adaptive layout requires a custom detail panel abstraction — bottom-sheet doesn't support horizontal/side-panel rendering | FR36, Amelia (Dev) |

### Cross-Cutting Concerns Identified

1. **Navigation architecture** — Highest-risk structural change. The floating navigation island replaces React Navigation's built-in tab bar but must still drive React Navigation state. Unlike styling concerns (which have fallbacks), this is structural — the tab bar visibility, the custom pill component, safe area handling, and auto-hide behavior must all work with React Navigation's navigator or the core design vision fails. Must be validated early and independently.

2. **Detail Panel Abstraction** — The detail views (PilotDetails, AtcDetails, CtrDetails, AirportAtcDetails, ClientDetails) currently render inside `@gorhom/bottom-sheet`. Phase 1 requires them to render in either a bottom sheet (portrait) or side panel (landscape) without code duplication. The architecture needs a `DetailPanelProvider` or equivalent abstraction that: (a) provides the container (sheet or panel) based on orientation, (b) exposes snap points / disclosure levels to children, (c) handles open/close/select lifecycle uniformly, (d) maintains the same Redux integration (`clientSelected` → open panel).

3. **Design token system with dual consumers** — Affects every component plus the map. The theme architecture has TWO token systems that must stay coordinated: (a) NativeWind/Tailwind tokens for app UI components, and (b) Google Maps JSON style objects for map appearance. These use completely different formats — NativeWind tokens cannot be referenced from inside Google Maps style JSON. The architecture must define a single source-of-truth color palette (likely `theme.js`) that exports both NativeWind config values AND the Maps JSON styles. If they diverge, you get mismatched themes (e.g., light app UI on dark map). Phase 2 extensibility for aviation themes required.

4. **Translucency/blur rendering** — Floating nav, bottom sheet, filter chips, and any overlay surface. Needs a shared blur wrapper component with device-capability-based fallback (solid semi-transparent background on devices where blur drops below 30fps). Performance testing required on mid-range devices.

5. **Progressive disclosure content architecture** — 5 detail view types × 3 disclosure levels = 15 distinct view states. Each level (glanceable, expanded, full) needs designed content for each client type. This is a design dependency that blocks implementation of the progressive disclosure components. The architecture must define the snap point → content level mapping.

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

**Selected: expo-blur** — ships with Expo SDK 55, major Android performance improvements, built-in fallback path for NFR4.

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
6. Blur Wrapper Design — BlurWrapper + PlatformCapabilityProvider

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

**Decision:** Hide existing tab bar + custom `FloatingNavIsland` overlay component.

**Rationale:** Lowest-risk approach. React Navigation's tab navigator continues to manage screen state, caching, and back behavior. The floating island is a styled button group that calls `navigate()`. Instant fallback: re-enable tab bar visibility.

**Implementation:**
- `MainTabNavigator` keeps its tab navigator with `tabBarStyle: { display: 'none' }`
- `FloatingNavIsland` component positioned absolutely at bottom of map screen
- Uses `useNavigation()` to call `navigation.navigate()` for tab switches
- Wrapped in `BlurWrapper` for frosted-glass appearance
- Auto-hide behavior: hides during map pan gestures, reappears on tap/idle
- Safe area handling via `useSafeAreaInsets()`
- **Affects:** MainTabNavigator, VatsimMapView (island placement), all tab screens (visual context)

### Detail Panel Abstraction

**Decision:** Build `DetailPanelProvider` abstraction now, implement portrait bottom sheet only. Landscape side panel added later without touching detail views.

**Rationale:** All 5 detail views code against the provider API from day one. When landscape ships (Phase 1 or OTA follow-up), only the side panel container needs implementing — zero changes to PilotDetails, AtcDetails, CtrDetails, AirportAtcDetails, or ClientDetails.

**Implementation:**
- `DetailPanelProvider` wraps the map screen
- Exposes API: `disclosureLevel` (1/2/3), `isOpen`, `open(client)`, `close()`, `selectedClient`
- Portrait: renders `@gorhom/bottom-sheet` with three snap points
- Landscape: stub/TODO — renders side panel container when implemented
- Listens to orientation via `useWindowDimensions()` to select container
- Integrates with Redux: `clientSelected` action dispatches → provider opens
- **Affects:** VatsimMapView, ClientDetails, all 5 detail view components

### Progressive Disclosure Snap Points

**Decision:** Hybrid percentage-based snap points with min/max constraints. Additive content rendering.

**Rationale:** Scales with device size (phone vs tablet) while guaranteeing minimum usability on small screens.

**Implementation:**
- Level 1 (glanceable): `Math.max(120, 15%)` — callsign, type, one-line summary
- Level 2 (expanded): `Math.max(300, 40%)` — key details (frequency, altitude, flight plan summary)
- Level 3 (full): `85%` — everything (full ATIS, complete flight plan, route)
- `DetailPanelProvider` tracks current snap index → maps to `disclosureLevel`
- Detail views receive level, render additively: always show L1; if >= 2, add L2 section; if === 3, add L3 section
- **Affects:** DetailPanelProvider, all 5 detail view components (content organization)

### Migration Order

**Decision:** Infrastructure-first, then screens top-down by priority.

**Rationale:** Front-loads shared components so every screen migration is straightforward. Map screen comes early for maximum validation of NativeWind + react-native-maps + blur interaction.

**Implementation Sequence:**
1. **Infrastructure:** NativeWind config, tailwind.config.js, global.css, babel/metro plugins
2. **Theme system:** Extended theme.js, ThemeContext, PlatformCapabilityProvider
3. **Shared components:** BlurWrapper, FloatingNavIsland, FloatingFilterChips, DetailPanelProvider
4. **Map screen:** VatsimMapView, MapComponent, PilotMarkers, AirportMarkers, CTRPolygons — full-bleed + floating HUD
5. **Detail views:** ClientDetails, PilotDetails, AtcDetails, CtrDetails, AirportAtcDetails — progressive disclosure
6. **List view:** VatsimListView + FilterBar
7. **Airport view:** AirportDetailsView, AirportSearchList, AirportListItem
8. **Events + Bookings:** VatsimEventsView, EventListItem, EventDetailsView, BookingsView, BookingDeatils
9. **Secondary screens:** Settings (theme toggle), About, NetworkStatus, MetarView, LoadingView
10. **Polish:** Remove react-native-paper dependency, final visual QA, both platforms

### Blur Wrapper Design

**Decision:** Reusable `BlurWrapper` component backed by `PlatformCapabilityProvider` context.

**Rationale:** Single capability check at app startup. All blur surfaces read the decision from context. Natural extension point for user preference toggle ("Reduce transparency" in Settings).

**Implementation:**
- `PlatformCapabilityProvider` at app root checks: iOS → blur supported; Android 12+ → blur supported; Android < 12 → fallback
- `BlurWrapper` component reads context, renders either `BlurView` (expo-blur) or semi-transparent `View`
- Props: `intensity` (default 45), `tint` (auto from theme: light/dark), `fallbackOpacity` (default 0.45)
- Used by: FloatingNavIsland, DetailPanelProvider (sheet backdrop), FloatingFilterChips
- **Affects:** All translucent UI surfaces, PlatformCapabilityProvider, Settings (future toggle)

### Decision Impact Analysis

**Implementation Sequence Dependencies:**

```
theme.js (tokens) → tailwind.config.js → NativeWind setup
                  → ThemeContext → PlatformCapabilityProvider
                                 → BlurWrapper
                                 → FloatingNavIsland
                                 → DetailPanelProvider → Detail views
                                 → FloatingFilterChips
                                 → Map screen (full-bleed + HUD)
```

**Cross-Component Dependencies:**
- BlurWrapper depends on PlatformCapabilityProvider (context)
- FloatingNavIsland depends on BlurWrapper + ThemeContext
- DetailPanelProvider depends on BlurWrapper + ThemeContext + orientation detection
- All detail views depend on DetailPanelProvider (disclosure level API)
- Map screen depends on FloatingNavIsland + DetailPanelProvider + FloatingFilterChips + ThemeContext (map style)
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

**Standard translucency values:**
- Floating surfaces (nav island, filter chips): `intensity={45}`, `fallbackOpacity={0.45}`
- Detail panel backdrop: `intensity={60}`, `fallbackOpacity={0.6}`
- These values are defaults in BlurWrapper — only override with explicit rationale

### Detail Panel Provider Patterns

**Always use the provider API. Never access bottom sheet refs directly from detail views.**

```jsx
// Correct — in a detail view component
const { disclosureLevel, close } = useDetailPanel();
return (
  <>
    <Level1Summary client={client} />
    {disclosureLevel >= 2 && <Level2Details client={client} />}
    {disclosureLevel >= 3 && <Level3Full client={client} />}
  </>
);

// Wrong — reaching into bottom sheet directly
const bottomSheetRef = useRef();
bottomSheetRef.current.snapToIndex(1);
```

**Disclosure level content rules:**
- Level 1 is ALWAYS rendered (base content)
- Level 2 ADDS to Level 1 (never replaces)
- Level 3 ADDS to Level 1 + Level 2 (never replaces)
- Each level section is a separate sub-component: `<Level1Summary>`, `<Level2Details>`, `<Level3Full>`

**Disclosure Content Mapping (implementation contract):**

| Detail Type | Level 1 (glanceable) | Level 2 (expanded) | Level 3 (full) |
|---|---|---|---|
| Pilot | Callsign, aircraft type, dep→arr | Altitude, speed, heading, route summary | Full flight plan text, time online, rating |
| ATC (airport) | Callsign, frequency, position type | ATIS text (if available), rating | Full text ATIS, logon time, controller info |
| CTR | Callsign, frequency, sector name | Rating, FIR boundary info | Full ATIS text, coverage area detail |
| Airport ATC | Airport name, # positions staffed | List of staffed positions with frequencies | Individual controller details per position |
| Airport | Airport name + ICAO, staffing indicator | Departures/arrivals count, staffed positions | Full traffic list, METAR link, ATC bookings |

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
| PlatformCapabilityProvider | `app/common/PlatformCapabilityProvider.jsx` | App-wide context provider |
| ThemeContext / ThemeProvider | `app/common/ThemeProvider.jsx` | App-wide context provider |
| FloatingNavIsland | `app/components/navigation/FloatingNavIsland.jsx` | New navigation feature component |
| FloatingFilterChips | `app/components/filterBar/FloatingFilterChips.jsx` | Replaces/augments existing FilterBar |
| DetailPanelProvider | `app/components/detailPanel/DetailPanelProvider.jsx` | New abstraction for detail views |
| Level1Summary, Level2Details, Level3Full | Inside each detail view's directory | Co-located with the detail view that owns them |

**Provider import rule:** Providers (`DetailPanelProvider`, `ThemeProvider`, `PlatformCapabilityProvider`) can be imported by any component across directories. Feature components should NOT import from sibling feature directories except for providers.

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
- Never import `expo-blur` directly — always use `BlurWrapper`
- Never access `@gorhom/bottom-sheet` refs from detail view components — always use `DetailPanelProvider`
- Follow the additive disclosure pattern (L1 always, L2 adds, L3 adds)
- Use custom theme tokens from `tailwind.config.js`, never NativeWind defaults
- Use Reanimated `useAnimatedStyle()` for animations, never NativeWind class toggling

### Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| `import { Button } from 'react-native-paper'` in migrated component | Paper is being removed | Use NativeWind-styled `Pressable` or `TouchableOpacity` |
| `className="bg-blue-500"` | Uses NativeWind default palette, not project tokens | `className="bg-primary"` (custom token) |
| `<BlurView>` in a feature component | Bypasses fallback logic | `<BlurWrapper>` |
| `bottomSheetRef.current.snapToIndex(2)` in PilotDetails | Breaks detail panel abstraction | `useDetailPanel()` API |
| Conditional rendering that replaces L1 at L2 | Breaks additive disclosure | L2 section adds below L1 |
| `style={{ position: 'absolute', bottom: 20 }}` on FloatingNavIsland | Inline styles violate ESLint | StyleSheet.create() for positioning |
| `className={isVisible ? 'opacity-100' : 'opacity-0'}` for animations | Discrete class swaps, not smooth transitions | Reanimated `useAnimatedStyle()` with shared values |
| `import PilotDetails from '../clientDetails/PilotDetails'` in AirportView | Feature components importing from sibling feature dirs | Only import providers cross-directory |

## Project Structure & Boundaries

### Complete Project Directory Structure

Existing structure preserved. **New files/directories marked with ➕**. Modified files marked with ✏️.

```
VatView/
├── App.js                                    ✏️ Add ThemeProvider, PlatformCapabilityProvider wrapping
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
│   │   ├── BlurWrapper.jsx                   ➕ Reusable blur/fallback component
│   │   ├── PlatformCapabilityProvider.jsx    ➕ Blur capability detection context
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
│   │   ├── detailPanel/                      ➕ New directory
│   │   │   └── DetailPanelProvider.jsx       ➕ Bottom sheet / side panel abstraction
│   │   │
│   │   ├── vatsimMapView/
│   │   │   ├── VatsimMapView.jsx             ✏️ Full-bleed map, wrap with DetailPanelProvider
│   │   │   ├── MapComponent.jsx              ✏️ Theme-aware customMapStyle from ThemeContext
│   │   │   ├── PilotMarkers.jsx              ✏️ NativeWind migration
│   │   │   ├── AirportMarkers.jsx            ✏️ NativeWind migration
│   │   │   └── CTRPolygons.jsx               ✏️ NativeWind migration (StyleSheet for Polygon styles)
│   │   │
│   │   ├── clientDetails/
│   │   │   ├── ClientDetails.jsx             ✏️ Use DetailPanelProvider API, route by client type
│   │   │   ├── PilotDetails.jsx              ✏️ 3-level progressive disclosure (L1/L2/L3 sub-components)
│   │   │   ├── PilotLevel1Summary.jsx        ➕ Callsign, aircraft, dep→arr
│   │   │   ├── PilotLevel2Details.jsx        ➕ Altitude, speed, heading, route summary
│   │   │   ├── PilotLevel3Full.jsx           ➕ Full flight plan, time online, rating
│   │   │   ├── AtcDetails.jsx                ✏️ 3-level progressive disclosure
│   │   │   ├── AtcLevel1Summary.jsx          ➕
│   │   │   ├── AtcLevel2Details.jsx          ➕
│   │   │   ├── AtcLevel3Full.jsx             ➕
│   │   │   ├── CtrDetails.jsx                ✏️ 3-level progressive disclosure
│   │   │   ├── CtrLevel1Summary.jsx          ➕
│   │   │   ├── CtrLevel2Details.jsx          ➕
│   │   │   ├── CtrLevel3Full.jsx             ➕
│   │   │   ├── AirportAtcDetails.jsx         ✏️ 3-level progressive disclosure
│   │   │   ├── AirportAtcLevel1Summary.jsx   ➕
│   │   │   ├── AirportAtcLevel2Details.jsx   ➕
│   │   │   └── AirportAtcLevel3Full.jsx      ➕
│   │   │
│   │   ├── filterBar/
│   │   │   ├── FilterBar.jsx                 ✏️ NativeWind migration (may be replaced by FloatingFilterChips)
│   │   │   └── FloatingFilterChips.jsx       ➕ Translucent floating filter toggles
│   │   │
│   │   ├── airportView/
│   │   │   ├── AirportDetailsView.jsx        ✏️ NativeWind migration + progressive disclosure
│   │   │   ├── AirportLevel1Summary.jsx      ➕
│   │   │   ├── AirportLevel2Details.jsx      ➕
│   │   │   ├── AirportLevel3Full.jsx         ➕
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
<PlatformCapabilityProvider>          ← blur capability detection (once)
  <ThemeProvider>                      ← theme context (isDark, mapStyle, toggle)
    <Provider store={store}>           ← Redux store (existing)
      <NavigationContainer>            ← React Navigation (existing)
        <MainApp />
      </NavigationContainer>
    </Provider>
  </ThemeProvider>
</PlatformCapabilityProvider>
```

**Component Communication Boundaries:**

| Boundary | Direction | Mechanism |
|---|---|---|
| Components → Redux | Read | `useSelector(state => state.<slice>)` |
| Components → Redux | Write | `useDispatch()` + `allActions.<module>.<action>()` |
| Components → Theme | Read | NativeWind `dark:` classes (automatic) |
| Components → Map Style | Read | `useTheme()` → `activeMapStyle` |
| Components → Blur Capability | Read | `BlurWrapper` (reads context internally) |
| Detail Views → Panel Container | Read/Write | `useDetailPanel()` → `disclosureLevel`, `open()`, `close()` |
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
| **Map Experience** (FR1-8) | `VatsimMapView.jsx`, `MapComponent.jsx`, `PilotMarkers.jsx`, `AirportMarkers.jsx`, `CTRPolygons.jsx` | `FloatingNavIsland.jsx`, `FloatingFilterChips.jsx`, `DetailPanelProvider.jsx` |
| **Progressive Disclosure** (FR9-11) | `ClientDetails.jsx`, `PilotDetails.jsx`, `AtcDetails.jsx`, `CtrDetails.jsx`, `AirportAtcDetails.jsx` | 15 Level sub-components (`*Level1Summary.jsx`, `*Level2Details.jsx`, `*Level3Full.jsx`) |
| **Navigation** (FR12-14) | `MainTabNavigator.jsx`, `MainApp.jsx` | `FloatingNavIsland.jsx` |
| **Filtering** (FR15-18) | `FilterBar.jsx`, `VatsimListView.jsx`, `AirportDetailsView.jsx` | `FloatingFilterChips.jsx` |
| **Theming** (FR29-33) | `theme.js`, `App.js` | `ThemeProvider.jsx`, `tailwind.config.js`, `global.css`, `lightMapStyle`/`darkMapStyle` in theme.js |
| **Orientation** (FR34-37) | `VatsimMapView.jsx` | `DetailPanelProvider.jsx` (orientation-aware container switching) |
| **Settings** (FR38) | `Settings.jsx` | Theme toggle UI added to Settings |
| **Blur/Translucency** (NFR4, FR33) | — | `BlurWrapper.jsx`, `PlatformCapabilityProvider.jsx` |

### Cross-Cutting Concern Locations

| Concern | Files |
|---|---|
| Theme tokens | `theme.js` → `tailwind.config.js` → every component via NativeWind classes |
| Blur rendering | `PlatformCapabilityProvider.jsx` → `BlurWrapper.jsx` → FloatingNavIsland, DetailPanelProvider, FloatingFilterChips |
| Progressive disclosure | `DetailPanelProvider.jsx` → all 5 detail views → 15 level sub-components |
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
| FR9-11 (Progressive Disclosure) | ✅ | DetailPanelProvider snap points, 15 level sub-components, additive pattern |
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
| NFR4 (Blur fallback) | ✅ | PlatformCapabilityProvider + BlurWrapper automatic fallback |
| NFR5 (Orientation transition) | ✅ | DetailPanelProvider via useWindowDimensions |
| NFR6 (Theme no restart) | ✅ | React context + NativeWind dark: — instant |
| NFR7 (Cold start) | ✅ | PlatformCapabilityProvider is a single sync check |
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

1. **Google Maps dark theme JSON** — Architecture specifies two map style sets but doesn't define the dark theme JSON rules. Current `blueGreyMapStyle` (37 rules) serves as light theme baseline. **Resolution:** Create during migration step 2 (theme system). Invert luminance values from existing style.

2. **ClusteredPilotMarkers status** — Listed as "in-progress" in docs. Not in PRD scope. **Resolution:** Continue as-is, migrate when reached in step 4.

3. **react-native-paper replacement mapping** — Architecture says "replace Paper components" but doesn't list specific Paper→NativeWind equivalents. **Resolution:** Each migration story identifies Paper components in the target file and documents the replacement (Paper `Button` → `Pressable` + NativeWind, Paper `Text` → RN `Text` + NativeWind, Paper `Surface` → `View` + NativeWind/BlurWrapper).

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
