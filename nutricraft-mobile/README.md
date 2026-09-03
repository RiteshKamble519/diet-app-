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

## Known limitation

Not screenshot-verified in a running simulator/device from this session —
the sandbox this was built in blocks Expo CLI's own network calls
(unrelated to the app code). It does typecheck cleanly (`npx tsc --noEmit`)
and reuses the same request/response contract already verified against the
Bun and Node backends. Worth a first real run on your end before assuming
everything is pixel-perfect — flag anything visually broken and it's a
quick fix.
