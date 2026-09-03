# NutriCraft AI Backend (Bun)

Same API contract as `../nutricraft-app` (the Express version), rewritten
for the Bun runtime — no framework, just `Bun.serve`. Serves the
`nutricraft-mobile` React Native app (and could serve any other frontend
that speaks the same JSON contract).

## Run it

```bash
bun install   # no dependencies to install, but creates the lockfile
cp .env.example .env   # optional, see below
bun start
```

Listens on `http://0.0.0.0:8787` by default (override with `PORT`).

## API key (optional)

- No `GEMINI_API_KEY` set → fallback mode: every generate/refine call
  returns a canned sample plan built from the submitted profile. Fully
  testable with zero setup.
- Real AI plans → get a key from https://aistudio.google.com/apikey, put
  it in `.env` as `GEMINI_API_KEY=...`, restart. `.env` is gitignored.

## Routes

- `GET /api/health` → `{ status, aiEnabled }`
- `POST /api/generate-plan` — body: profile object (biometrics, diet
  prefs, conditions, exclusions, cuisines, etc.) → `{ plan, source }`
  (`source` is `"gemini"` or `"fallback"`)
- `POST /api/refine-plan` — body: `{ profile, currentPlan, modText }` →
  same response shape

CORS is wide open (`*`) since this is meant to be hit from a mobile app /
Expo dev client, not just a browser on the same origin. Tighten this if
you ever put it behind a public URL for more than personal testing.
