# VatView

VatView is a cross-platform mobile app for tracking live [VATSIM](https://vatsim.net) data — pilots, ATC controllers, airports, and events — on an interactive map.

<a href='https://apps.apple.com/us/app/vatview/id1562497035'><img src="https://raw.githubusercontent.com/o4oren/VatView/master/graphics/store/appstore.png" alt='Get it on the App Store' style="max-width: 200px;"></a>
<a href='https://play.google.com/store/apps/details?id=com.gevahim.vatview'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' style="max-width: 230px;"/></a>

---

## Features

- Live VATSIM map with pilot and ATC markers, updated every 20 seconds
- Type-specific aircraft icons for 50+ aircraft types
- Real FIR/UIR and TRACON boundary polygons
- Airport markers with staffed ATC positions and traffic count badges
- Progressive disclosure detail panels for pilots, controllers, and airports
- Pilot and controller list view with map jump
- Events and ATC bookings
- METAR weather search
- Light and dark themes
- Landscape orientation support

## Documentation

See the [docs folder](./docs/index.md) for full architecture, component inventory, and development guide.

[Release Notes](./docs/release-notes.md)

---

## Development Setup

### Prerequisites

- Node.js
- Expo CLI
- For native builds: Xcode (iOS) or Android Studio (Android)

### Install & Run

```bash
npm install
npm start          # Start Expo dev client
npm run ios        # Build and run on iOS simulator
npm run android    # Build and run on Android
npm run lint       # Run ESLint
```

### Firebase & API Keys

This app uses Firebase (Crashlytics, Analytics) and Google Maps. The config files are not included in the repository. To run native builds locally you need to supply your own:

- `google-services.json` — Android Firebase config (place in project root)
- `GoogleService-Info.plist` — iOS Firebase config (place in project root)
- A Google Maps API key configured in `app.config.js`

For contributors: create a free Firebase project at [console.firebase.google.com](https://console.firebase.google.com), download the config files for your app, and place them in the project root. They are gitignored and will not be committed.

### Production Builds (EAS)

```bash
npx eas-cli@latest build --profile production          # Build both platforms
npx eas-cli@latest submit -p ios --latest              # Submit to App Store Connect
npx eas-cli@latest submit -p android --latest          # Submit to Google Play
```

OTA updates (JS-only changes):

```bash
npx eas-cli@latest update --branch production --message "Description of fix"
```

---

## Assets Attribution

Aircraft SVG icons from [FSTrAk](https://github.com/NickSwardh/FSTrAk).
App icons made by [Freepik](https://www.freepik.com) from [Flaticon](https://www.flaticon.com).
