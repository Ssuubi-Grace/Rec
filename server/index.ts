import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkStorage, closeDb, initDb, loadRecruitmentState, resetRecruitmentState, saveRecruitmentState } from './db.ts';
import type { RecruitmentStatePayload } from './seedData.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    const storage = await checkStorage();
    res.json({ ok: true, storage, durable: storage === 'postgres', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ ok: false, storage: 'postgres', error: 'Database is unavailable' });
  }
});

app.get('/api/recruitment/state', async (_req, res) => {
  try {
    const state = await loadRecruitmentState();
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load recruitment state' });
  }
});

app.put('/api/recruitment/state', async (req, res) => {
  try {
    const body = req.body as RecruitmentStatePayload;
    if (!body || !['requisitions', 'candidates', 'psychometricTests', 'offers', 'onboardingTasks', 'approvalTasks', 'documentTemplates'].every(key => Array.isArray(body[key]))) {
      res.status(400).json({ error: 'Invalid state payload' });
      return;
    }
    await saveRecruitmentState(body);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save recruitment state' });
  }
});

app.post('/api/recruitment/reset', async (_req, res) => {
  try {
    const state = await resetRecruitmentState();
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset recruitment state' });
  }
});

const distIndex = path.join(distPath, 'index.html');
const serveSpa = process.env.NODE_ENV === 'production' || fs.existsSync(distIndex);

if (serveSpa) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

await initDb();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ProMISe API listening on http://0.0.0.0:${PORT} (${process.env.DATABASE_URL ? 'PostgreSQL' : 'local file'})`);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});
