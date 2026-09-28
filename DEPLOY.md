# Deploy ProMISe Recruitment to Render (boss demo link)

This app now **persists recruitment data** (requisitions, candidates, offers, approvals, templates, etc.) through a small **Express API** and **PostgreSQL** on Render. Mock seed files are unchanged; the database is seeded from them on first request.

## Local development (persist across refresh)

1. Install dependencies: `npm install`
2. Run **both** UI and API:
   ```bash
   npm run dev:full
   ```
3. Open http://localhost:3000 — edits auto-save to `server/.data/recruitment-state.json` after ~1s (no Postgres required locally).

Optional: set `DATABASE_URL` in `.env` to use PostgreSQL locally instead of the file.

## Deploy to Render (shareable HTTPS link)

### 1. Put the project on GitHub

Your folder should be its **own** repository (current `origin` may point elsewhere — create a new repo for this project and push):

```bash
git remote add demo https://github.com/YOUR_ORG/promise-recruitment.git
git push -u demo main
```

### 2. Create Render services

1. Go to [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect the GitHub repo containing this project.
3. Render reads **`render.yaml`**, which creates:
   - **Web service** `promise-recruitment` (Node, builds Vite + runs API)
   - **PostgreSQL** `promise-recruitment-db` (free tier)
4. Deploy. First deploy takes a few minutes.

Your boss demo URL will look like:

`https://promise-recruitment.onrender.com`

(Exact subdomain depends on your Render service name.)

### 3. Demo login (unchanged)

- HR: `grace.ssuubi@promise.ug` (any password on landing)
- Candidate: `robert.kintu@gmail.com` (career portal)

### 4. E2E test with persistence

Run your full flow in **one browser** — refresh the page; candidates and requisitions should **still be there** because they live in Postgres.

To reset the demo to original mock seed:

```bash
curl -X POST https://YOUR-SERVICE.onrender.com/api/recruitment/reset
```

### 5. Free tier notes

- Render free web services **spin down** after inactivity; first visit may take 30–60s to wake.
- Free Postgres has storage limits; fine for demo volume.

## API (for reference)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/recruitment/state` | Load full recruitment state |
| PUT | `/api/recruitment/state` | Save state (auto-called from UI) |
| POST | `/api/recruitment/reset` | Restore mock seed in DB |

## What is *not* in the database yet

- Security users list (still in-memory in Security Management)
- Browser `localStorage` for role permissions and audit trail (unchanged)

Those can be added in a follow-up if needed for the demo.
