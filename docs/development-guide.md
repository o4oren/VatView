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

### Development Workflow

There are two ways to develop: **local builds** (fast, for emulators) and **EAS cloud builds** (for physical devices and distribution).

#### Local Development (emulators)

The fastest development loop. Builds natively on your machine and connects to Metro for hot reloading. Only needs a rebuild when native dependencies change (e.g., adding a new native library). Otherwise, Metro hot-reloads JS changes automatically.

```bash
npm start              # Start Metro bundler
npm run ios            # Build & run on iOS simulator
npm run android        # Build & run on Android emulator
```

#### Dev Client on Physical Devices

Build a dev client in the EAS cloud and install it on a real device. Once installed, it connects to your local Metro server (`npm start`) for live reloading — same experience as an emulator.

```bash
# Build dev client for physical devices
eas build --profile development --platform android   # Produces installable .apk
eas build --profile development --platform ios        # Install via TestFlight or ad-hoc

# Build dev client for iOS simulator
eas build --profile ios-simulator --platform ios

# Then start Metro and connect from the dev client
npm start
```

You only need to rebuild the dev client when native dependencies change. Day-to-day JS changes are served live by Metro.

#### Testing (preview builds)

Preview builds bundle the JS and don't need Metro — good for sharing test builds with others or testing release-like behavior:

```bash
eas build --profile preview --platform all
```

#### Production & App Store Deployment

```bash
# 1. Bump user-facing version in app.json (e.g., "1.9.2" → "1.10.0")
#    Build numbers are auto-incremented by EAS (see Version Management below)

# 2. Build production binaries
eas build --profile production --platform all

# 3. Submit to stores
eas submit --platform ios        # → App Store Connect
eas submit --platform android    # → Google Play Console
```

### Build Profiles Summary

Profiles are defined in `eas.json`:

| Profile | Purpose | Distribution | Needs Metro? |
|---|---|---|---|
| `development` | Dev client for physical devices | Internal | Yes |
| `ios-simulator` | Dev client for iOS simulator | Internal | Yes |
| `preview` | Test builds (JS bundled) | Internal | No |
| `production` | App store submission | Store | No |

---

## OTA Updates (expo-updates)

Production uses Expo OTA updates (`expo-updates ~0.25.25`). OTA updates push JS-only changes without a full app store release.

```bash
# Publish an OTA update
eas update --branch production --message "Fix: ..."
```

> **Note:** OTA updates can only change JS/assets. Native dependency changes (new libraries, SDK upgrades) require a full `eas build` + store submission.

---

## Version Management

App versioning uses **EAS remote version source** (`cli.appVersionSource: "remote"` in `eas.json`). This means:

- **`expo.version`** in `app.json` — The user-facing version string (e.g., "1.9.2"). You bump this manually when releasing a new version.
- **`buildNumber` (iOS) / `versionCode` (Android)** — Auto-incremented by EAS on each build. You don't need to manage these.

To check or manually set the remote build numbers:

```bash
# View current remote version
eas build:version:get --platform ios
eas build:version:get --platform android

# Manually set (e.g., after initial setup or reset)
eas build:version:set --platform ios --build-number 1.9.2
eas build:version:set --platform android --version-code 192
```

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
