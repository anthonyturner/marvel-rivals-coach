import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { Hero } from './app/heroes/hero.model';
import { GlossaryTerm } from './app/glossary/glossary.model';

type DatabaseSync = {
  prepare: (sql: string) => {
    all: (...params: unknown[]) => unknown[];
    get: (...params: unknown[]) => unknown;
  };
  close: () => void;
};

type ContentStatus = {
  databasePath: string;
  exists: boolean;
  heroes: number;
  glossaryTerms: number;
  externalSources: number;
};

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite') as {
  DatabaseSync: new (path: string, options?: { readOnly?: boolean }) => DatabaseSync;
};

const databasePath = join(process.cwd(), 'data', 'marvel-rivals-coach.db');

export function getHeroesFromDatabase(): Hero[] {
  return queryRows<{ raw_json: string }>(
    'SELECT raw_json FROM heroes ORDER BY name COLLATE NOCASE',
  ).map((row) => JSON.parse(row.raw_json) as Hero);
}

export function getHeroFromDatabase(id: string): Hero | undefined {
  const row = queryOne<{ raw_json: string }>(
    'SELECT raw_json FROM heroes WHERE id = ?',
    id,
  );

  return row ? JSON.parse(row.raw_json) as Hero : undefined;
}

export function getGlossaryTermsFromDatabase(): GlossaryTerm[] {
  return queryRows<{ raw_json: string }>(
    'SELECT raw_json FROM glossary_terms ORDER BY term COLLATE NOCASE',
  ).map((row) => JSON.parse(row.raw_json) as GlossaryTerm);
}

export function getExternalSourceFromDatabase(sourceKey: string): unknown | undefined {
  const row = queryOne<{ payload_json: string }>(
    'SELECT payload_json FROM external_sources WHERE source_key = ?',
    sourceKey,
  );

  return row ? JSON.parse(row.payload_json) : undefined;
}

export function getContentStatusFromDatabase(): ContentStatus {
  if (!existsSync(databasePath)) {
    return {
      databasePath,
      exists: false,
      heroes: 0,
      glossaryTerms: 0,
      externalSources: 0,
    };
  }

  return withDatabase((db) => ({
    databasePath,
    exists: true,
    heroes: getCount(db, 'heroes'),
    glossaryTerms: getCount(db, 'glossary_terms'),
    externalSources: getCount(db, 'external_sources'),
  }));
}

function queryRows<T>(sql: string, ...params: unknown[]): T[] {
  return withDatabase((db) => db.prepare(sql).all(...params) as T[]);
}

function queryOne<T>(sql: string, ...params: unknown[]): T | undefined {
  return withDatabase((db) => db.prepare(sql).get(...params) as T | undefined);
}

function getCount(db: DatabaseSync, tableName: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get() as { count: number };

  return row.count;
}

function withDatabase<T>(query: (db: DatabaseSync) => T): T {
  if (!existsSync(databasePath)) {
    throw new Error(`SQLite database not found at ${databasePath}. Run npm run db:seed first.`);
  }

  const db = new DatabaseSync(databasePath, { readOnly: true });

  try {
    return query(db);
  } finally {
    db.close();
  }
}
