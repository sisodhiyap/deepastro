# DeepAstro Production Runbook & Incident Management

## 1. Production Architecture Overview
- **Hosting:** Vercel Production Serverless Edge (`https://deepastro.vercel.app`).
- **Runtime:** Node.js 24 LTS with WHATWG standard URL shims.
- **Frontend:** Vite 6 + React 18, code-split into granular vendor/domain chunks.
- **Backend:** Express API served via Vercel Serverless Function entry point (`api/index.ts`).

---

## 2. Health Monitoring & Triage
### Probing Production Endpoints:
```bash
# 1. API Status Ping
curl -s https://deepastro.vercel.app/api

# 2. Comprehensive Brain & Subsystems Health
curl -s https://deepastro.vercel.app/api/health

# 3. Test Ephemeris Calculation
curl -X POST https://deepastro.vercel.app/api/astrology/kundli \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-10-15","birthTime":"08:30:00","birthPlace":"New Delhi, India","latitude":28.6139,"longitude":77.2090,"timezone":5.5}'
```

---

## 3. Database Incident Handling (Supabase Free Tier Inactivity Pause)
- **Symptom:** Logs show `(ENOTFOUND) tenant/user postgres.bytufynvpwqhphoirxfo not found`, `/api/health` indicates `databaseMode: "in-memory"`.
- **Diagnosis:** The Supabase Free Tier project has auto-paused due to inactivity.
- **Resolution:**
  1. Navigate to the Supabase Dashboard: `https://supabase.com/dashboard/project/bytufynvpwqhphoirxfo`.
  2. Click **"Restore project"**.
  3. Wait ~2 minutes for the database cluster to spin up.
  4. DeepAstro's `PostgresService` automatically detects the restored cluster on its 30-second ping cycle and transitions back to `databaseMode: "postgres"` without redeployment.

---

# 4. Deployment Procedure
```bash
# 1. Verify TypeScript strict typing
npm run typecheck

# 2. Run full automated test suite
npm test

# 3. Production client and server build
npm run build

# 4. Deploy to Vercel Production
npx vercel --prod --yes
```

---

## 5. Future Intelligence Operations & Monitoring (FUTURE_INTELLIGENCE_V1)

### Probing Future Intelligence Endpoints:
```bash
# 1. Check Available Kundlis for User
curl -s https://deepastro.vercel.app/api/future-intelligence/charts \
  -H "Authorization: Bearer <TOKEN>"

# 2. Test Real Kundli Forecast Generation (5-Year Horizon)
curl -X POST https://deepastro.vercel.app/api/future-intelligence/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"chartId":"primary","years":5}'

# 3. Verify Month-by-Month Breakdown for a Specific Year
curl -s "https://deepastro.vercel.app/api/future-intelligence/<FORECAST_ID>/year/2028" \
  -H "Authorization: Bearer <TOKEN>"
```

### Invalidation & Recalculation:
- **Automatic Invalidation:** Whenever a birth profile's coordinates, date, or time are mutated, the calculation fingerprint changes, automatically bypassing the cache.
- **Manual Force Recalculate:** To force recalculation without mutating birth details, pass `"forceRecalculate": true` in the POST payload:
```json
{
  "chartId": "primary",
  "years": 5,
  "forceRecalculate": true
}
```

### Incomplete Context Error Code (HTTP 422):
- When an API request lacks verified Kundli parameters, the server returns HTTP `422` with code `PREDICTION_CONTEXT_INCOMPLETE` and a structured payload listing `missingEngines`.
- Resolution: Ensure the user's primary birth profile is saved via `/api/astrology/birth-profile` or provide a valid `chartId`.
