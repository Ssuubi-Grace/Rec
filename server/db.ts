import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { buildDefaultRecruitmentState, type RecruitmentStatePayload } from './seedData.ts';

const STATE_KEY = 'recruitment';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_STORE = path.join(__dirname, '.data', 'recruitment-state.json');

let pool: pg.Pool | null = null;

export async function checkStorage(): Promise<'postgres' | 'file'> {
  if (usePostgres()) {
    if (!pool) throw new Error('Database is not initialized');
    await pool.query('SELECT 1');
    return 'postgres';
  }
  return 'file';
}

function usePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function initDb(): Promise<void> {
  if (usePostgres()) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : undefined,
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    return;
  }

  fs.mkdirSync(path.dirname(FILE_STORE), { recursive: true });
}

async function readFileState(): Promise<RecruitmentStatePayload | null> {
  try {
    const raw = fs.readFileSync(FILE_STORE, 'utf8');
    return JSON.parse(raw) as RecruitmentStatePayload;
  } catch {
    return null;
  }
}

function writeFileState(payload: RecruitmentStatePayload): void {
  fs.mkdirSync(path.dirname(FILE_STORE), { recursive: true });
  fs.writeFileSync(FILE_STORE, JSON.stringify(payload, null, 2), 'utf8');
}

export async function loadRecruitmentState(): Promise<RecruitmentStatePayload> {
  if (usePostgres() && pool) {
    const res = await pool.query('SELECT payload FROM app_state WHERE id = $1', [STATE_KEY]);
    if (res.rows[0]?.payload) {
      return res.rows[0].payload as RecruitmentStatePayload;
    }
    const seeded = buildDefaultRecruitmentState();
    await saveRecruitmentState(seeded);
    return seeded;
  }

  const fileState = await readFileState();
  if (fileState) return fileState;
  const seeded = buildDefaultRecruitmentState();
  writeFileState(seeded);
  return seeded;
}

export async function saveRecruitmentState(payload: RecruitmentStatePayload): Promise<void> {
  if (usePostgres() && pool) {
    await pool.query(
      `INSERT INTO app_state (id, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [STATE_KEY, JSON.stringify(payload)]
    );
    return;
  }
  writeFileState(payload);
}

export async function resetRecruitmentState(): Promise<RecruitmentStatePayload> {
  const seeded = buildDefaultRecruitmentState();
  await saveRecruitmentState(seeded);
  return seeded;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
