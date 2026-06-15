import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const databasePath = join(projectRoot, 'data', 'marvel-rivals-coach.db');
const schemaPath = join(__dirname, 'sqlite-schema.sql');

const sources = [
  {
    key: 'fandom-battlepasses',
    name: 'Marvel Rivals Fandom BattlePasses',
    url: 'https://marvelrivals.fandom.com/api.php?action=parse&page=BattlePasses&prop=wikitext&format=json&origin=*',
  },
  {
    key: 'fandom-deadpool',
    name: 'Marvel Rivals Fandom Deadpool',
    url: 'https://marvelrivals.fandom.com/api.php?action=parse&page=Deadpool&prop=wikitext&format=json&origin=*',
  },
  {
    key: 'fandom-deadpool-abilities-template',
    name: 'Marvel Rivals Fandom Deadpool Ability Template',
    url: 'https://marvelrivals.fandom.com/api.php?action=parse&page=Template:Abilities/Deadpool&prop=wikitext&format=json&origin=*',
  },
];

mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(readFileSync(schemaPath, 'utf8'));
db.exec('PRAGMA foreign_keys = ON;');

const insertSyncRun = db.prepare(`
  INSERT INTO sync_runs (source_key, status, message, started_at)
  VALUES (?, ?, ?, ?)
`);
const finishSyncRun = db.prepare(`
  UPDATE sync_runs
  SET status = ?, message = ?, finished_at = ?
  WHERE id = ?
`);
const upsertSource = db.prepare(`
  INSERT INTO external_sources (
    source_key, source_name, url, payload_json, fetched_at, status, error
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(source_key) DO UPDATE SET
    source_name = excluded.source_name,
    url = excluded.url,
    payload_json = excluded.payload_json,
    fetched_at = excluded.fetched_at,
    status = excluded.status,
    error = excluded.error
`);

for (const source of sources) {
  const startedAt = new Date().toISOString();
  const runId = insertSyncRun.run(source.key, 'running', `Fetching ${source.url}`, startedAt).lastInsertRowid;

  try {
    const response = await fetch(source.url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'marvel-rivals-coach-content-sync/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const fetchedAt = new Date().toISOString();

    upsertSource.run(
      source.key,
      source.name,
      source.url,
      JSON.stringify(payload),
      fetchedAt,
      'success',
      null,
    );
    finishSyncRun.run('success', `Fetched ${source.name}`, fetchedAt, runId);
    console.log(`Synced ${source.key}`);
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);

    upsertSource.run(source.key, source.name, source.url, '{}', finishedAt, 'error', message);
    finishSyncRun.run('error', message, finishedAt, runId);
    console.error(`Failed ${source.key}: ${message}`);
  }
}

db.close();
