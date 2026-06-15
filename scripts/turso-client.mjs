import { createClient } from '@tursodatabase/serverless/compat';

try {
  process.loadEnvFile?.('.env');
} catch {
  // Environment variables may already be provided by the shell or deployment host.
}

export function createTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running this script.');
  }

  return createClient({
    url,
    authToken,
  });
}

export async function executeSchema(client, schema) {
  for (const statement of splitSqlStatements(schema)) {
    await client.execute(statement);
  }
}

export async function columnExists(client, tableName, columnName) {
  const result = await client.execute(`PRAGMA table_info(${tableName})`);

  return result.rows.some((column) => column.name === columnName);
}

export function splitSqlStatements(sql) {
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}
