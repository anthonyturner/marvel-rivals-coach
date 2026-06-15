import { createClient, type Client } from '@tursodatabase/serverless/compat';

import { GlossaryTerm } from './app/glossary/glossary.model';
import { Hero } from './app/heroes/hero.model';

const nodeProcess = process as typeof process & {
  loadEnvFile?: (path?: string) => void;
};

try {
  nodeProcess.loadEnvFile?.('.env');
} catch {
  // Environment variables may already be provided by the shell or deployment host.
}

type ContentStatus = {
  databaseProvider: 'turso';
  databaseUrl: string;
  configured: boolean;
  heroes: number;
  glossaryTerms: number;
  externalSources: number;
};

let client: Client | undefined;

export async function getHeroesFromDatabase(): Promise<Hero[]> {
  return queryRows<{ raw_json: string }>(
    'SELECT raw_json FROM heroes ORDER BY name COLLATE NOCASE',
  ).then((rows) => rows.map((row) => JSON.parse(row.raw_json) as Hero));
}

export async function getHeroFromDatabase(id: string): Promise<Hero | undefined> {
  const row = await queryOne<{ raw_json: string }>(
    'SELECT raw_json FROM heroes WHERE id = ?',
    id,
  );

  return row ? JSON.parse(row.raw_json) as Hero : undefined;
}

export async function getGlossaryTermsFromDatabase(): Promise<GlossaryTerm[]> {
  return queryRows<{ raw_json: string }>(
    'SELECT raw_json FROM glossary_terms ORDER BY term COLLATE NOCASE',
  ).then((rows) => rows.map((row) => JSON.parse(row.raw_json) as GlossaryTerm));
}

export async function getExternalSourceFromDatabase(sourceKey: string): Promise<unknown | undefined> {
  const row = await queryOne<{ payload_json: string }>(
    'SELECT payload_json FROM external_sources WHERE source_key = ?',
    sourceKey,
  );

  return row ? JSON.parse(row.payload_json) : undefined;
}

export async function getContentStatusFromDatabase(): Promise<ContentStatus> {
  return {
    databaseProvider: 'turso',
    databaseUrl: getSafeDatabaseUrl(),
    configured: Boolean(process.env['TURSO_DATABASE_URL'] && process.env['TURSO_AUTH_TOKEN']),
    heroes: await getCount('heroes'),
    glossaryTerms: await getCount('glossary_terms'),
    externalSources: await getCount('external_sources'),
  };
}

async function queryRows<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const result = await getClient().execute(sql, params as never[]);

  return result.rows as unknown as T[];
}

async function queryOne<T>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  const rows = await queryRows<T>(sql, ...params);

  return rows[0];
}

async function getCount(tableName: string): Promise<number> {
  const row = await queryOne<{ count: number }>(`SELECT COUNT(*) AS count FROM ${tableName}`);

  return row?.count ?? 0;
}

function getClient(): Client {
  if (client) {
    return client;
  }

  const url = process.env['TURSO_DATABASE_URL'];
  const authToken = process.env['TURSO_AUTH_TOKEN'];

  if (!url || !authToken) {
    throw new Error('Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  }

  client = createClient({
    url,
    authToken,
  });

  return client;
}

function getSafeDatabaseUrl(): string {
  const url = process.env['TURSO_DATABASE_URL'];

  if (!url) {
    return 'not configured';
  }

  return url.replace(/\/\/([^./]+)[^.]*/, '//$1...');
}
