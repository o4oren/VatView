# Fix Simulator Certificate

Installs the Netskope corporate proxy root CA into a booted iOS simulator so HTTPS requests work.

## When to use

When the user reports "Network request failed" on an iOS simulator, especially after creating a new simulator or wiping simulator data.

## Instructions

1. Get the UUID of the booted simulator(s):
   ```bash
   xcrun simctl list devices booted
   ```

2. Extract the Netskope root CA from the proxy chain:
   ```bash
   echo | openssl s_client -connect api.github.com:443 -servername api.github.com -showcerts 2>/dev/null | awk 'BEGIN{n=0} /BEGIN CERTIFICATE/{n++} n==3' > /tmp/netskope-root-ca.pem
   ```

3. Install into each booted simulator:
   ```bash
   xcrun simctl keychain <DEVICE_UUID> add-root-cert /tmp/netskope-root-ca.pem
   ```

4. Tell the user to restart the app on the simulator.

## Background

Intuit uses Netskope proxy (`ca.intuitprd.goskope.com`) that intercepts HTTPS with its own root CA. The Mac trusts it via Keychain, but iOS simulators have their own trust store that doesn't inherit it. New simulators or data wipes require reinstalling the cert.
