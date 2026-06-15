import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { buildHeroPlaystyle } from './playstyle-utils.mjs';

const databasePath = join(process.cwd(), 'data', 'marvel-rivals-coach.db');

if (!existsSync(databasePath)) {
  throw new Error(`SQLite database not found at ${databasePath}`);
}

const db = new DatabaseSync(databasePath);
const rows = db.prepare('SELECT id, raw_json FROM heroes').all();
const updateHero = db.prepare('UPDATE heroes SET playstyle = ?, raw_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
let updated = 0;

db.exec('BEGIN;');

try {
  for (const row of rows) {
    const hero = JSON.parse(row.raw_json);
    const nextPlaystyle = buildHeroPlaystyle(hero);

    if (nextPlaystyle === hero.playstyle) {
      continue;
    }

    const nextHero = {
      ...hero,
      playstyle: nextPlaystyle,
    };

    updateHero.run(nextPlaystyle, JSON.stringify(nextHero), row.id);
    updated += 1;
  }

  db.exec('COMMIT;');
} catch (error) {
  db.exec('ROLLBACK;');
  throw error;
} finally {
  db.close();
}

console.log(`Refreshed playstyles for ${updated} heroes.`);
