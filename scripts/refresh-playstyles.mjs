import { buildHeroPlaystyle } from './playstyle-utils.mjs';
import { createTursoClient } from './turso-client.mjs';

const db = createTursoClient();
const rows = (await db.execute('SELECT id, raw_json FROM heroes')).rows;
let updated = 0;

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

  await db.execute(
    'UPDATE heroes SET playstyle = ?, raw_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nextPlaystyle, JSON.stringify(nextHero), row.id],
  );
  updated += 1;
}

db.close();

console.log(`Refreshed playstyles for ${updated} heroes.`);
