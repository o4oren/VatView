# VatView — Development Guide

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | LTS recommended | |
| npm | bundled with Node | |
| Expo CLI | via `npx expo` | No global install needed |
| EAS CLI | `>= 9.2.0` | For builds: `npm install -g eas-cli` |
| Android Studio | Latest | For Android emulator + SDK |
| Xcode | Latest | For iOS simulator (macOS only) |
| Expo Go / Dev Client | — | Dev client required (not plain Expo Go) |

**Google Maps API Key** required for both iOS and Android — configured in `app.json`.

**Firebase** config files required:
- `google-services.json` — Android (root)
- `GoogleService-Info.plist` — iOS (root)

---

## Installation

```bash
git clone https://github.com/o4oren/VatView.git
cd VatView
npm install
```

---

## Running the App

```bash
# Start Expo dev server
npm start
# or: npx expo start --dev-client

# Build and run on Android device/emulator
npm run android
# or: npx expo run:android

# Build and run on iOS simulator (macOS only)
npm run ios
# or: npx expo run:ios

# Run on web (limited functionality)
npm run web
```

> **Note:** The app uses a **custom dev client** (`expo-dev-client`), not plain Expo Go. Run `expo run:android` or `expo run:ios` to build the native dev client first.

---

## Linting

```bash
npm run lint
# or: eslint .
```

**Key ESLint rules enforced:**
- `react-native/no-inline-styles` — ERROR
- `react-native/no-color-literals` — ERROR
- `react-native/no-raw-text` — ERROR
- `react-native/no-unused-styles` — ERROR
- `semi` — ERROR (required)
- `indent` — WARN (4 spaces)
- `quotes` — WARN (single quotes)

---

## Testing

No test suite is configured. Manual testing on device/emulator.

---

## Build & Distribution (EAS)

```bash
# Development build (internal distribution)
eas build --profile development --platform android
eas build --profile development --platform ios

# iOS Simulator build
eas build --profile ios-simulator --platform ios

# Preview build (internal distribution)
eas build --profile preview --platform all

# Production build (app store submission)
eas build --profile production --platform all

# Submit to stores
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

Build profiles defined in `eas.json`:
- `development` — dev client, internal distribution
- `ios-simulator` — extends development, simulator target
- `preview` — internal distribution, production-like
- `production` — store submission

---

## OTA Updates (expo-updates)

Production uses Expo OTA updates (`expo-updates ~0.25.25`). Configured via `eas.json` and `app.json`.

```bash
# Publish an OTA update
eas update --branch production --message "Fix: ..."
```

---

## App Version

Current version: **1.9.1** (iOS `buildNumber`, Android `versionCode: 191`)

Bump version in `app.json`:
- `expo.version` — user-facing version string
- `expo.ios.buildNumber` — iOS build number
- `expo.android.versionCode` — Android version code (integer, must increment)

---

## Static Data Versioning

When the SQLite schema or airport/FIR data format changes:

1. Bump `STATIC_DATA_VERSION` in `app/common/consts.js`
2. The app will automatically drop and repopulate SQLite tables on next launch

---

## Key Environment Configuration

All sensitive keys live in `app.json` (checked in — use environment substitution for CI):

| Key | Location | Used For |
|---|---|---|
| Google Maps API Key | `app.json` → ios.config + android.config | Map rendering |
| Firebase (web) | `app.json` → web.config.firebase | Web analytics |
| EAS Project ID | `app.json` → extra.eas.projectId | EAS Build |
| Firebase Android | `google-services.json` | Crashlytics, Auth |
| Firebase iOS | `GoogleService-Info.plist` | Crashlytics, Auth |

---

## Debugging Tips

- **Redux DevTools:** Enabled via `redux-devtools-extension` — connect with React Native Debugger
- **Console logs:** Extensive `console.log` throughout actions — useful for tracing data flow
- **Crashlytics:** Production crashes auto-reported to Firebase
- **SQLite issues:** Check `STATIC_DATA_VERSION` and `airportsLoaded`/`firBoundariesLoaded` flags in Redux state
