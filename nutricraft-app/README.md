# NutriCraft AI

Diet planner with a small Express backend and a static frontend, wired together.

## What's here

- `public/index.html` — the diet planner UI (biometrics, health conditions,
  diet/cuisine preferences, AI plan generation, refinement, grocery list).
- `server.js` — Express server that serves the frontend and exposes two
  API routes that call the Gemini API **server-side**, so no API key is ever
  sent to the browser.

## Run it

```bash
cd nutricraft-app
npm install
cp .env.example .env      # optional — see below
npm start
```

Open **http://localhost:8080**.

## API key (optional)

- If `GEMINI_API_KEY` is **not set**, the server runs in fallback mode: every
  "Generate Diet Plan" / "Refine Plan" click returns a canned sample plan
  built from your selections, so the whole app is testable with zero setup.
- To get real AI-generated plans, get a key from
  https://aistudio.google.com/apikey, put it in `.env` as
  `GEMINI_API_KEY=...`, and restart the server. `.env` is gitignored — the
  key never gets committed or shipped to the browser.

## API routes

- `GET /api/health` → `{ status, aiEnabled }`
- `POST /api/generate-plan` — body is the user's profile (biometrics, diet
  prefs, conditions, exclusions, cuisines, etc.), returns `{ plan, source }`
  where `source` is `"gemini"` or `"fallback"`.
- `POST /api/refine-plan` — body is `{ profile, currentPlan, modText }`,
  same response shape.
