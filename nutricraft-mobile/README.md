# NutriCraft AI — Mobile (Expo / React Native)

React Native rebuild of the diet planner, talking to the Bun backend in
`../nutricraft-backend`.

## Run it

You'll need two terminals — the backend, and the Expo dev server.

**1. Start the backend** (from repo root):

```bash
cd nutricraft-backend
bun install
bun start
```

By default it runs in offline/fallback mode (no `GEMINI_API_KEY` needed —
see its README for adding a real key).

**2. Point the app at your backend**

Open `src/config.ts` and set `API_BASE_URL` to wherever the backend is
reachable from your phone/simulator. `localhost` on a physical device means
the phone itself, not your computer — see the comments in that file for
the right value for your setup (LAN IP for a physical phone via Expo Go,
`10.0.2.2` for Android emulator, `localhost` for iOS simulator).

**3. Start Expo**

```bash
cd nutricraft-mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS/Android) to run it on your
phone, or press `w` for the web preview, `i`/`a` for a simulator/emulator.

## Structure

- `src/screens/` — the 4-step wizard: Biometrics → Diet Prefs → Cuisines →
  Dashboard, mirroring the original web app's flow.
- `src/store.tsx` — shared wizard state via React Context.
- `src/api.ts` / `src/config.ts` — calls to the Bun backend.
- `src/types.ts` — shared `Profile`/`Plan` shapes (matches the backend's).

## Building a real .apk to install on your phone

This needs **EAS Build** (Expo's free cloud build service) — it can't be
run from this sandbox (its network is blocked from reaching Expo's
servers), so do this from your own computer:

```bash
cd nutricraft-mobile
npm install -g eas-cli   # one-time
eas login                # create a free Expo account if you don't have one
eas build -p android --profile preview
```

That queues a build on Expo's servers (a few minutes), then prints a link
to download the `.apk` directly — open that link on your phone (or scan
the QR code EAS prints) and it installs like any sideloaded app. You may
need to allow "install unknown apps" for your browser/Files app the first
time.

**Important — set `API_BASE_URL` to a public URL before building.** A
built APK runs standalone on your phone with no dev machine involved, so
`localhost` or a LAN IP won't work anymore — the backend needs a real
public URL (e.g. deployed to Render, see `../nutricraft-backend`). Update
`src/config.ts` to point at it, commit, *then* run `eas build`.

`eas.json` (already in this folder) defines a `preview` profile that
builds an installable `.apk` instead of Google Play's `.aab` bundle.

## Known limitation

Not screenshot-verified in a running simulator/device from this session —
the sandbox this was built in blocks Expo CLI's own network calls
(unrelated to the app code). It does typecheck cleanly (`npx tsc --noEmit`)
and reuses the same request/response contract already verified against the
Bun and Node backends. Worth a first real run on your end before assuming
everything is pixel-perfect — flag anything visually broken and it's a
quick fix.
