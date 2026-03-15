# Story 1.5: ListItem Base Component & StaleIndicator

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want list-based views to have consistent, spacious item styling and a subtle data freshness indicator,
So that all lists feel cohesive and I always know if the data is current.

## Acceptance Criteria

1. **Given** TranslucentSurface and ThemedText from Stories 1.3–1.4 are available, **When** `ListItem.jsx` is created in `app/components/shared/`, **Then** it renders with 64px minimum height, three slots (left icon 42×42px, body with title + subtitle, trailing meta/chevron), and a bottom separator line.
2. **Given** `ListItem.jsx` exists, **When** it is tapped, **Then** it shows a tap highlight feedback using `Pressable` with `duration.fast` (150ms) timing via `Animated`.
3. **Given** `ListItem.jsx` exists, **When** checking touch targets, **Then** the pressable area meets the 44×44px minimum (enforced by `minHeight: 64` + `paddingVertical` padding that ensures 44px even with single-line content).
4. **Given** `ListItem.jsx` exists, **When** rendering in light or dark theme, **Then** all colors come from `activeTheme` tokens — no hardcoded color literals.
5. **Given** `StaleIndicator.jsx` is created in `app/components/shared/`, **When** rendered with `status="live"`, **Then** it shows a green dot (`activeTheme.status.online`), no animation.
6. **Given** `StaleIndicator.jsx` exists, **When** rendered with `status="stale"`, **Then** it shows an amber dot (`activeTheme.status.stale`) with a slow repeating opacity pulse animation.
7. **Given** `StaleIndicator.jsx` exists, **When** rendered with `status="error"`, **Then** it shows a red dot (use `'#F85149'` for light, `'#FF7B72'` for dark — values from UX spec) with a repeating opacity pulse animation.
8. **Given** `StaleIndicator.jsx` exists, **When** the system "Reduce Motion" accessibility setting is enabled (`AccessibilityInfo.isReduceMotionEnabled()`), **Then** pulse animations are skipped and the dot renders at full opacity without animating.
9. **Given** `StaleIndicator.jsx` exists, **When** it renders, **Then** it has `accessibilityLabel` announcing data state (e.g., `"Data status: live"`, `"Data status: stale"`, `"Data status: error"`).

## Tasks / Subtasks

- [x] Task 1: Create `ListItem.jsx` in `app/components/shared/` (AC: #1, #2, #3, #4)
  - [x] 1.1: Create `app/components/shared/ListItem.jsx`
  - [x] 1.2: Import `React, useRef` from `react`; `Animated, Pressable, View, StyleSheet` from `react-native`; `useTheme` from `../../common/ThemeProvider`; `tokens` from `../../common/themeTokens`
  - [x] 1.3: Implement tap highlight using `Animated.Value` (opacity 1→0.6 on press-in, back to 1 on press-out) with `Animated.timing` using `tokens.animation.duration.fast` (150ms)
  - [x] 1.4: Render structure: `<Pressable onPress onPressIn onPressOut>` → `<Animated.View style={[styles.container, {opacity: animValue}]}>` → `{leftSlot && <View style={styles.leftSlot}>}` + `<View style={styles.body}>` + `{trailingSlot && <View style={styles.trailingSlot}>}` + `<View style={styles.separator}>`
  - [x] 1.5: `styles.container`: `minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10`
  - [x] 1.6: `styles.leftSlot`: `width: 42, height: 42, marginRight: 12, justifyContent: 'center', alignItems: 'center'`
  - [x] 1.7: `styles.body`: `flex: 1, justifyContent: 'center'`
  - [x] 1.8: `styles.trailingSlot`: `marginLeft: 8, alignItems: 'flex-end', justifyContent: 'center'`
  - [x] 1.9: `styles.separator`: colored `activeTheme.surface.border`, `height: StyleSheet.hairlineWidth`, `marginLeft: 16` (separator indented to align with body text)
  - [x] 1.10: Accept props: `leftSlot` (ReactNode), `title` (string, required), `subtitle` (string, optional), `trailingSlot` (ReactNode), `onPress` (function), `style` (ViewStyle)
  - [x] 1.11: Render `title` as `<ThemedText variant="body">{title}</ThemedText>` and `subtitle` (if provided) as `<ThemedText variant="body-sm" color={activeTheme.text.secondary}>{subtitle}</ThemedText>`
  - [x] 1.12: Export `ListItem` as default

- [x] Task 2: Create `StaleIndicator.jsx` in `app/components/shared/` (AC: #5, #6, #7, #8, #9)
  - [x] 2.1: Create `app/components/shared/StaleIndicator.jsx`
  - [x] 2.2: Import `React, useEffect, useRef, useState` from `react`; `Animated, View, StyleSheet, AccessibilityInfo` from `react-native`; `useTheme` from `../../common/ThemeProvider`
  - [x] 2.3: Accept props: `status` (`'live' | 'stale' | 'error'`, default `'live'`), `style`
  - [x] 2.4: On mount, call `AccessibilityInfo.isReduceMotionEnabled()` and store result in state (`reduceMotion`)
  - [x] 2.5: Define `DOT_SIZE = 10` (px)
  - [x] 2.6: Resolve dot color from `activeTheme` based on status: `live → activeTheme.status.online`, `stale → activeTheme.status.stale`, `error → isDark ? '#FF7B72' : '#F85149'`
  - [x] 2.7: For `stale` and `error` (when `!reduceMotion`): use `Animated.loop(Animated.sequence([Animated.timing(pulseAnim, {toValue: 0.3, duration: 800, useNativeDriver: true}), Animated.timing(pulseAnim, {toValue: 1, duration: 800, useNativeDriver: true})]))` — start on mount, stop and reset on unmount or status change back to `live`
  - [x] 2.8: For `live` or when `reduceMotion=true`: ensure `pulseAnim` is set to `1` (full opacity, no pulse)
  - [x] 2.9: Render `<View style={[styles.wrapper, style]} accessibilityLabel={`Data status: ${status}`} accessible={true}>` → `<Animated.View style={[styles.dot, {backgroundColor: dotColor, opacity: pulseAnim}]} />`
  - [x] 2.10: `styles.wrapper`: `width: DOT_SIZE, height: DOT_SIZE, justifyContent: 'center', alignItems: 'center'`
  - [x] 2.11: `styles.dot`: `width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2`
  - [x] 2.12: Export `StaleIndicator` as default

- [x] Task 3: Lint and regression check (AC: all)
  - [x] 3.1: Run `npm run lint` — fix any new errors (pay attention to `no-color-literals`, `no-inline-styles`, `no-raw-text`)
  - [x] 3.2: Confirm no existing files are modified (only new files created in this story)
  - [x] 3.3: Confirm `ThemedText` import path from `app/components/shared/` is `../../common/ThemeProvider` (two levels up: shared → components → app, then into common)

## Dev Notes

### Overview

This story creates exactly **2 new files**, both in the existing `app/components/shared/` directory:

- `app/components/shared/ListItem.jsx` — base component for all list-based views
- `app/components/shared/StaleIndicator.jsx` — ambient data freshness indicator

No existing files are modified. `app/components/shared/` was created in Story 1.4 when `ThemedText.jsx` was added.

### Dependency Map

```
ListItem.jsx
  ├── app/common/ThemeProvider.jsx  (useTheme → activeTheme, isDark)
  ├── app/common/themeTokens.js     (tokens.animation.duration.fast = 150)
  └── app/components/shared/ThemedText.jsx  (title/subtitle rendering)

StaleIndicator.jsx
  └── app/common/ThemeProvider.jsx  (useTheme → activeTheme, isDark)
```

`TranslucentSurface` is NOT used in either component. `ListItem` is a plain surface with a separator (not a floating card). The UX spec describes `ListItem` as the base for all lists — it does not have a frosted-glass background. Floating cards that use `TranslucentSurface` will be composed on top of `ListItem` in future stories (e.g., `ClientCard` in Story 4.2).

### Import Paths

Both files live in `app/components/shared/`. The import path for common utilities:

```javascript
// From app/components/shared/<Component>.jsx:
import {useTheme} from '../../common/ThemeProvider';   // app/common/ThemeProvider.jsx
import {tokens} from '../../common/themeTokens';         // app/common/themeTokens.js
import ThemedText from './ThemedText';                    // same directory
```

### ListItem — Full Implementation

```javascript
import React, {useRef} from 'react';
import {Animated, Pressable, View, StyleSheet} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from './ThemedText';

export default function ListItem({leftSlot, title, subtitle, trailingSlot, onPress, style}) {
    const {activeTheme} = useTheme();
    const animValue = useRef(new Animated.Value(1)).current;

    function handlePressIn() {
        Animated.timing(animValue, {
            toValue: 0.6,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
        }).start();
    }

    function handlePressOut() {
        Animated.timing(animValue, {
            toValue: 1,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
        }).start();
    }

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={[styles.container, style, {opacity: animValue}]}>
                {leftSlot && <View style={styles.leftSlot}>{leftSlot}</View>}
                <View style={styles.body}>
                    <ThemedText variant="body">{title}</ThemedText>
                    {subtitle ? (
                        <ThemedText variant="body-sm" color={activeTheme.text.secondary}>
                            {subtitle}
                        </ThemedText>
                    ) : null}
                </View>
                {trailingSlot && <View style={styles.trailingSlot}>{trailingSlot}</View>}
                <View style={[styles.separator, {backgroundColor: activeTheme.surface.border}]} />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    leftSlot: {
        width: 42,
        height: 42,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        flex: 1,
        justifyContent: 'center',
    },
    trailingSlot: {
        marginLeft: 8,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    separator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
});
```

**Critical layout note:** The `separator` uses `position: 'absolute'` with `bottom: 0` and `left: 16` to sit at the bottom of the row, indented to align with the body text column (past the left slot + margin = 42 + 12 + 16 padding = ~70px, but 16px from absolute left keeps it visually aligned with text left edge). `backgroundColor` is set inline with `activeTheme.surface.border` — this is a dynamic value reference, not a color literal, so ESLint `no-color-literals` does not fire.

### StaleIndicator — Full Implementation

```javascript
import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, StyleSheet, AccessibilityInfo} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';

const DOT_SIZE = 10;

function getErrorColor(isDark) {
    return isDark ? '#FF7B72' : '#F85149';
}

export default function StaleIndicator({status = 'live', style}) {
    const {activeTheme, isDark} = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    }, []);

    useEffect(() => {
        if (status === 'live' || reduceMotion) {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {toValue: 0.3, duration: 800, useNativeDriver: true}),
                Animated.timing(pulseAnim, {toValue: 1, duration: 800, useNativeDriver: true}),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [status, reduceMotion, pulseAnim]);

    let dotColor;
    if (status === 'stale') {
        dotColor = activeTheme.status.stale;
    } else if (status === 'error') {
        dotColor = getErrorColor(isDark);
    } else {
        dotColor = activeTheme.status.online;
    }

    return (
        <View
            style={[styles.wrapper, style]}
            accessibilityLabel={`Data status: ${status}`}
            accessible={true}
        >
            <Animated.View style={[styles.dot, {backgroundColor: dotColor, opacity: pulseAnim}]} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
    },
});
```

**Error color note:** The `activeTheme` tokens don't have an `error` key (only `status.online` and `status.stale`). The UX spec provides explicit error red values: `'#F85149'` (light) and `'#FF7B72'` (dark) — these are sourced from the GitHub-style error palette that the design system is based on. These are **constants**, not inline color literals — defined in `getErrorColor()` helper to avoid ESLint `no-color-literals`. If the linter still fires on the string in the helper function body, add them as `const` at module scope instead.

**Animated.Value placement:** `useRef(new Animated.Value(1))` — `new Animated.Value` in `useRef` is the correct RN pattern. The `useRef` prevents re-creation on re-render, and `.current` gives stable reference. Do NOT call `new Animated.Value` outside a `useRef` or `useState` — it would create a new instance on every render, breaking animations.

**`useNativeDriver: true`:** Both animations use `useNativeDriver: true` because only `opacity` is animated (a natively animatable property). This keeps animations off the JS thread. Do NOT animate `backgroundColor` with `useNativeDriver: true` — that is not natively animatable.

**`AccessibilityInfo.isReduceMotionEnabled()`** returns a Promise. The `useState(false)` default ensures no animation flash before the async check resolves (false = allow motion by default, conservative). After the Promise resolves, if motion is reduced, the animation is stopped immediately.

### Key ESLint Rules to Watch

- `no-color-literals`: The `dotColor` assignment uses `activeTheme.*` references (OK) or `getErrorColor()` return values (OK — the string literals are inside a named function, not inline in JSX `style`). If ESLint still fires on the helper, move the error colors to module-level `const ERROR_COLOR_LIGHT = '#F85149'` etc.
- `no-inline-styles`: The inline style objects `{opacity: pulseAnim}` and `{backgroundColor: dotColor}` use variables, not object literals — ESLint targets object literals with hardcoded values. These should pass. If not, extract to a styles map with `useTheme`-based colors passed via prop.
- `no-unused-styles`: Every `StyleSheet` entry must be referenced in JSX. Verify `wrapper` and `dot` are both used.
- `no-raw-text`: No bare strings in JSX. Both components only use `ThemedText` (ListItem) or have no Text at all (StaleIndicator). This is fine.

### Project Conventions (from previous stories)

- `export default function ComponentName()` — no class components, no arrow function exports
- StyleSheet defined AFTER the component function (same file, bottom of file) — consistent with ThemedText.jsx
- `useRef(new Animated.Value(n)).current` — store `.current` in a variable at the top of the component body
- No PropTypes, no JSDoc, no TypeScript
- 4-space indentation, single quotes, semicolons required
- All colors via tokens or `activeTheme` — except error red which has no token entry (see above)

### Previous Story Intelligence (from Story 1.4 review)

- **Font tokens:** Use `tokens.fontFamily.sans/mono/monoMedium` — do NOT hardcode font family strings
- **Dynamic inline values:** `{color: resolvedColor}` pattern with variable reference is NOT a lint error. Same applies here for `{backgroundColor: dotColor}` and `{opacity: pulseAnim}`
- **Variant fallback pattern:** Story 1.4 review added `VARIANT_STYLES[variant] || VARIANT_STYLES.body` fallback. Apply similar defensive patterns where relevant (e.g., unknown `status` prop falls through to `live` behavior)
- **`themeTokens.js` is CJS `module.exports`** — import as `import {tokens} from '../../common/themeTokens'` (ESM default import interop via Babel/Metro)
- **`useTheme()` returns `{ isDark, activeTheme, activeMapStyle, themePreference, toggleTheme }`** — only destructure what you use
- **5 pre-existing ESLint warnings in plugin files** — don't treat them as new errors; `npm run lint` with 0 new errors is the target

### Git Context (Recent Commits)

```
4337b1b Implement story 1-4: ThemedText and shared typography components
8d1a729 Implement story 1-3: BlurWrapper and TranslucentSurface components
d26b078 Implement story 1-2: ThemeProvider and dual map styling
b355ea1 Implement story 1-1: NativeWind infrastructure and design token system
```

Pattern: each story adds new files only. This story follows the same pattern — 2 new files in `app/components/shared/`, no existing files touched.

### What This Story Does NOT Do

- Does NOT migrate any existing list components (VatsimListView, EventListItem, etc.) to use `ListItem` — that is Epics 5–6
- Does NOT position `StaleIndicator` in the map view — that is Story 2.4 (`MapOverlayGroup`)
- Does NOT connect `StaleIndicator` to live Redux data state — it only renders based on the `status` prop it receives
- Does NOT add a `status.error` token to `themeTokens.js` — the two error red values are used only by `StaleIndicator` for now; tokenization can happen if more components need them
- Does NOT create `ClientCard`, `EventCard`, or any composed list items — those are Epics 3–6
- Does NOT use `TranslucentSurface` in either component

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.5 acceptance criteria and user story]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ListItem (Base Component) section, StaleIndicator section, Tap Feedback section, Data State table]
- [Source: _bmad-output/planning-artifacts/architecture.md — ListItem/StaleIndicator file locations (app/components/shared/), build order, component dependencies]
- [Source: app/common/themeTokens.js — tokens.animation.duration.fast=150, tokens.animation.duration.normal=250, status.online/stale colors, surface.border]
- [Source: app/common/ThemeProvider.jsx — useTheme() API: isDark, activeTheme]
- [Source: app/common/TranslucentSurface.jsx — BORDER_RADIUS_MAP pattern, overflow:hidden for iOS blur clipping]
- [Source: app/common/BlurWrapper.jsx — getBgColor pattern, useTheme destructuring pattern]
- [Source: app/components/shared/ThemedText.jsx — StyleSheet-only approach, useRef pattern, export default function, no PropTypes]
- [Source: _bmad-output/implementation-artifacts/1-4-themedtext-and-shared-typography-components.md — coding conventions, import paths, ESLint rules, pre-existing warnings]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Created `ListItem.jsx`: Pressable list row with 64px min height, left/body/trailing slots, animated tap highlight (opacity 1→0.6 via `tokens.animation.duration.fast`), absolute-positioned hairline separator, all colors from `activeTheme` tokens.
- Created `StaleIndicator.jsx`: 10px dot indicator with three states (live/stale/error). Stale and error states pulse opacity 1↔0.3 at 800ms via `Animated.loop`. Respects `AccessibilityInfo.isReduceMotionEnabled()`. Error red values defined as module-level constants to satisfy `no-color-literals` ESLint rule.
- `npm run lint` passes with 0 new errors (5 pre-existing plugin warnings unchanged).
- No existing files were modified.
- Code review fixes applied: `StaleIndicator` now reacts to runtime Reduce Motion setting changes and avoids post-unmount state updates; `ListItem` now includes button accessibility semantics.

### File List

- app/components/shared/ListItem.jsx (new)
- app/components/shared/StaleIndicator.jsx (new)
- _bmad-output/implementation-artifacts/1-5-listitem-base-component-and-staleindicator.md (updated during review)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status sync during review)

### Senior Developer Review (AI)

- Reviewer: Oren
- Date: 2026-03-15
- Outcome: Changes Requested issues were fixed automatically
- Fixed items:
  - Added runtime Reduce Motion change handling in `StaleIndicator` via `AccessibilityInfo` listener.
  - Guarded asynchronous Reduce Motion initialization to prevent setting state after unmount.
  - Added `accessibilityRole="button"` and explicit `accessibilityLabel` support for `ListItem` pressable rows.
- Result: All previously identified High and Medium issues for this story are resolved.

## Change Log

- Implement story 1-5: ListItem base component and StaleIndicator (Date: 2026-03-15)
- Apply code review fixes for accessibility and reduce-motion handling; set story status to done (Date: 2026-03-15)
