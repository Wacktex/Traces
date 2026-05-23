/**
 * Applies supabase/migrations/002_phase2_schema.sql
 * Requires DATABASE_URL or SUPABASE_DB_URL in .env.local
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvLocal() {
  const path = join(root, '.env.local');
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = { ...process.env, ...loadEnvLocal() };
const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL in .env.local');
  console.error('Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)');
  process.exit(1);
}

const sqlPath = join(root, 'supabase', 'migrations', '002_phase2_schema.sql');
const sql = readFileSync(sqlPath, 'utf8');

const { default: pg } = await import('pg');
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected. Applying Phase 2 migration…');
  await client.query(sql);
  console.log('✓ Phase 2 migration applied successfully.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
