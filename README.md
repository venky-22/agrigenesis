# 🌱 AgriGenesis

**An AI agent that turns bare land into a farm plan.**

Team AgriCan · Cognizant BrAInstorm Challenge 2026 · Tracks: Sustainability (primary), Accessibility & Inclusion

Atlantic Canada has lost more farmland since 2001 than any other region of Canada, and its farmers are ageing. New and small-scale farmers often have land but no plan for it, because planning a farm normally takes an agronomist, soil testing, and research across scattered climate and government data. AgriGenesis gives them that planning for free, in plain language, starting in Nova Scotia.

---

## What it does

| Page | Route | What the farmer gets |
|---|---|---|
| **Plan Farm** | `/analyze` → `/dashboard` | Upload a land photo, set the location and crop. The AI reads the photo with local weather and drafts a blueprint: crop suitability, land area, water need, irrigation, soil amendments, equipment, profit estimate and a sustainability grade. |
| **Climate Risk** | `/climate-risk` | A 0–100 risk score from the last 30 days of weather and the 7-day forecast (heat stress, drought, vegetation stress), an AI explanation, and crops suited to plant now. |
| **Crop Care** | `/crop-care` | In-season support: diagnose a plant photo, a live 7-day forecast with frost alerts, AI climate-risk bars, yield and revenue forecast, cost breakdown, and a chat assistant that knows the farm. |

The farm blueprint links to Climate Risk and Crop Care with the same crop and location filled in, so one plan flows through the whole season.

---

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
git clone https://github.com/venky-22/agrigenesis.git
cd agrigenesis
npm install
```

Create a `.env` file in the project root. It is git-ignored; never commit it.

```env
# Required: powers every AI feature (ask the team for the key)
ADAPTION_API_KEY=your_adaption_key_here

# Optional fallbacks for the Plan Farm analysis
VITE_GROQ_API_KEY=
VITE_GEMINI_API_KEY=
```

```bash
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

Without a key the app still runs, using sample data.

---

## How it works

```
Browser ──► /api/adaption/*  ──(Vite server adds ADAPTION_API_KEY)──►  Adaption Responses API
   │                                                                    model: gemma-4-31b-it
   ├──► Open-Meteo forecast + archive + geocoding (no key)              (text + image input)
   └──► Wikipedia (crop images)
```

- **One AI client** (`src/services/ai.js`): `aiText()` and `aiJSON()` are used by every page.
- **Key stays server-side**: `ADAPTION_API_KEY` has no `VITE_` prefix, so it never ships to the browser. The Vite dev/preview server proxies `/api/adaption/*` and adds the key.
- **Weather**: Open-Meteo, worldwide and free. Place names such as "Truro, Nova Scotia" are geocoded automatically.
- **Plan Farm fallbacks**: Adaption → Groq → Gemini → sample data.

### Project layout

```
src/
├── App.jsx                       routes
├── components/                   app shell (navbar), image upload, compare slider
├── pages/                        Landing, Plan Farm input, Farm blueprint dashboard
├── services/
│   ├── ai.js                     shared AI client (Adaption via proxy)
│   ├── gemini.js                 Plan Farm analysis + fallbacks
│   ├── weather.js                current conditions
│   └── imageGen.js, videoGen.js  optional blueprint visuals
└── features/
    ├── climate-risk/             risk engine, gauge, weather/NDVI charts
    └── crop-care/                diagnosis, forecast, yield, finance, chat
```

---

## Known limitations

- **NDVI is simulated** and labelled as such until satellite data (e.g. Sentinel Hub) is connected.
- **Finance figures** use rough per-acre cost and price assumptions.
- **AI diagnoses can be wrong.** Confirm with an extension specialist before treating crops.
- **Deploying**: the key proxy exists only in `npm run dev` / `npm run preview`. A hosted deploy needs an equivalent serverless function for `/api/adaption/*`.

## Roadmap

- Boundary drawing on a map, soil and slope data, real NDVI
- Frost dates and climate normals for the planting calendar
- Nova Scotia crop list (potatoes, wild blueberries, apples, forage)
- Task list and season plan that updates from progress photos

---

## License

MIT
