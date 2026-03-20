---
name: screenshot-mode
description: Prepare or remove screenshot mode for App Store / Play Store screenshots
user_invocable: true
---

# Screenshot Mode

Toggles "screenshot mode" in `app/redux/actions/vatsimLiveDataActions.js` for taking store screenshots with mock data.

## What it does

When enabling, inject the following block right after `let json = await response.json();` in `updateData`:

1. Replace all pilot names cycling through: Clarence Oveur, Roger Murdock, Ted Striker, Otto, Elaine Dickinson
2. Replace all controller and ATIS names cycling through: Steve McCroskey, Rex Kramer, Johnny Henshaw-Jacobs, Gunderson, Macias
3. Inject a fake `EURN_FSS` controller (facility 1) to show a UIR/FIR boundary polygon on the map
4. Do NOT clear existing controllers or pilots

The block must be clearly wrapped in `// --- SCREENSHOT MODE ---` and `// --- END SCREENSHOT MODE ---` comments.

## Usage

- `/screenshot-mode enable` — Add the screenshot mode block
- `/screenshot-mode disable` — Remove the screenshot mode block
- `/screenshot-mode` with no argument — Check current state and ask what to do

## Instructions

When **enabling**:
1. Read `app/redux/actions/vatsimLiveDataActions.js`
2. Verify the screenshot block is not already present
3. Insert the block after `let json = await response.json();` and before `json.cachedAirports = {`
4. Do NOT commit — this is temporary code

When **disabling**:
1. Read `app/redux/actions/vatsimLiveDataActions.js`
2. Remove everything between `// --- SCREENSHOT MODE` and `// --- END SCREENSHOT MODE ---` (inclusive)
3. Do NOT commit automatically — ask the user if they want to commit

Always warn the user not to ship screenshot mode to production.
