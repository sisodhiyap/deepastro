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

## 4. Deployment Procedure
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
