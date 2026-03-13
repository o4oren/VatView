# VatView — Technology Stack

## Core Runtime

| Category | Technology | Version |
|---|---|---|
| Framework | Expo | ^51.0.34 |
| React Native | react-native | 0.74.5 |
| React | react | 18.2.0 |
| Language | JavaScript (JSX) | ES2021 |
| Entry Point | `App.js` → `MainApp.jsx` | — |

## UI & Navigation

| Category | Technology | Version |
|---|---|---|
| UI Library | react-native-paper (Material Design v2) | ^4.4.1 |
| Navigation | React Navigation (Stack + Bottom Tabs) | ^6.x |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | ^14.0.0 |
| Bottom Sheet | @gorhom/bottom-sheet | ^4.6.3 |
| Gestures | react-native-gesture-handler | ~2.16.1 |
| Animations | react-native-reanimated | ~3.10.1 |
| Linear Gradient | expo-linear-gradient | ~13.0.2 |
| Safe Area | react-native-safe-area-context | 4.10.5 |
| Tab View | react-native-tab-view | ^3.5.2 |
| WebView | react-native-webview | 13.8.6 |
| HTML Renderer | react-native-render-html | ^5.1.0 |

## Maps

| Category | Technology | Version |
|---|---|---|
| Maps | react-native-maps (Google Maps provider) | 1.14.0 |
| Map Style | Custom blueGrey style (defined in `app/common/theme.js`) | — |
| Google Maps API | iOS + Android keys in `app.json` | — |

## State Management

| Category | Technology | Version |
|---|---|---|
| State | Redux | ^4.0.5 |
| Middleware | redux-thunk | ^2.3.0 |
| DevTools | redux-devtools-extension | ^2.13.8 |
| React bindings | react-redux | ^7.2.2 |

## Storage

| Category | Technology | Version | Usage |
|---|---|---|---|
| AsyncStorage | @react-native-async-storage/async-storage | 1.23.1 | Small key/value (region, flags) |
| File System | expo-file-system | ^17.0.1 | Large JSON blobs (FIR boundaries, static airspace) |
| SQLite | expo-sqlite | ~14.0.6 | Structured static data (airports, FIR boundaries) |

## Networking & Data

| Category | Technology | Version |
|---|---|---|
| HTTP | Native `fetch` API | — |
| XML parsing | fast-xml-parser | ^3.20.3 |
| METAR parsing | aewx-metar-parser | ^0.10.1 |
| Compression | lz-string | ^1.4.4 |

## Platform & Build

| Category | Technology | Version |
|---|---|---|
| Build system | EAS Build (Expo Application Services) | — |
| OTA Updates | expo-updates | ~0.25.25 |
| Dev Client | expo-dev-client | ~4.0.27 |
| Build config | eas.json | — |
| App config | app.json (Expo config) | version 1.9.1 |

## Firebase

| Category | Technology | Version |
|---|---|---|
| Firebase core | @react-native-firebase/app | ^20.1.0 |
| Auth | @react-native-firebase/auth | ^20.1.0 |
| Crashlytics | @react-native-firebase/crashlytics | ^20.1.0 |
| Analytics | expo-insights | ~0.7.0 |

## Intl Polyfills (Hermes/Android)

All `@formatjs/intl-*` polyfills loaded in `App.js` for Hermes engine compatibility:

- intl-getcanonicallocales, intl-locale, intl-pluralrules
- intl-displaynames, intl-listformat, intl-numberformat
- intl-relativetimeformat, intl-datetimeformat

## Development Tools

| Category | Technology | Version |
|---|---|---|
| Linting | ESLint | ^7.23.0 |
| ESLint config | eslint:recommended + react-native plugins | — |
| Babel | @babel/core | ^7.24.0 |
| Metro | metro.config.js | — |

## Architecture Pattern

- **Pattern:** Component-Redux-Thunk (unidirectional data flow)
- **Rendering:** React Native functional components with hooks
- **Data flow:** VATSIM API → Redux thunks → Redux store → `useSelector` in components
- **Persistence:** AsyncStorage (flags/region) + Expo FileSystem (JSON blobs) + SQLite (structured static data)
