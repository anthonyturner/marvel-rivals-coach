import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTursoClient } from './turso-client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const heroesPath = join(__dirname, '..', 'src', 'app', 'data', 'heroes.mock.json');

const counterPicksByHero = {
  'Adam Warlock': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  Angela: ['Hela', 'Hawkeye', 'The Punisher', 'Black Widow', 'Namor'],
  'Black Cat': ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'The Thing'],
  'Black Panther': ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'The Thing'],
  'Black Widow': ['Spider-Man', 'Black Panther', 'Psylocke', 'Venom', 'Magik'],
  Blade: ['Peni Parker', 'The Thing', 'Luna Snow', 'Mantis', 'Scarlet Witch'],
  Hulk: ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Mantis'],
  'Captain America': ['Wolverine', 'Hela', 'Hawkeye', 'Namor', 'Mantis'],
  'Cloak & Dagger': ['Spider-Man', 'Black Panther', 'Psylocke', 'Hela', 'Magik'],
  Daredevil: ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'The Thing'],
  Deadpool: ['Namor', 'Scarlet Witch', 'Peni Parker', 'Mantis', 'The Thing'],
  'Devil Dinosaur': ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Doctor Strange'],
  'Doctor Strange': ['Wolverine', 'Hela', 'Hawkeye', 'Magneto', 'Moon Knight'],
  'Elsa Bloodstone': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Venom'],
  'Emma Frost': ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Doctor Strange'],
  Gambit: ['Spider-Man', 'Black Panther', 'Psylocke', 'Hela', 'Moon Knight'],
  Groot: ['Wolverine', 'Human Torch', 'The Punisher', 'Hela', 'Doctor Strange'],
  Hawkeye: ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Venom'],
  Hela: ['Spider-Man', 'Black Panther', 'Psylocke', 'Captain America', 'Doctor Strange'],
  'Human Torch': ['Hela', 'Hawkeye', 'The Punisher', 'Black Widow', 'Namor'],
  'Invisible Woman': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  'Iron Fist': ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'Mantis'],
  'Iron Man': ['Namor', 'Hela', 'Hawkeye', 'The Punisher', 'Black Widow'],
  'Jeff the Land Shark': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  Loki: ['Spider-Man', 'Black Panther', 'Psylocke', 'Moon Knight', 'Scarlet Witch'],
  'Luna Snow': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  Magik: ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'The Thing'],
  Magneto: ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Doctor Strange'],
  Mantis: ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  'Mister Fantastic': ['Peni Parker', 'The Thing', 'Wolverine', 'Luna Snow', 'Mantis'],
  'Moon Knight': ['Spider-Man', 'Black Panther', 'Psylocke', 'Hela', 'Hawkeye'],
  Namor: ['Hela', 'Hawkeye', 'The Punisher', 'Black Widow', 'Doctor Strange'],
  'Peni Parker': ['Hela', 'Hawkeye', 'The Punisher', 'Human Torch', 'Doctor Strange'],
  Phoenix: ['Spider-Man', 'Black Panther', 'Psylocke', 'Hela', 'Hawkeye'],
  Psylocke: ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'Mantis'],
  'Rocket Raccoon': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Venom'],
  Rogue: ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Mantis'],
  'Scarlet Witch': ['Hela', 'Hawkeye', 'The Punisher', 'Black Widow', 'Doctor Strange'],
  'Spider-Man': ['Namor', 'Scarlet Witch', 'Peni Parker', 'Luna Snow', 'Mantis'],
  'Squirrel Girl': ['Spider-Man', 'Black Panther', 'Psylocke', 'Hela', 'Hawkeye'],
  'Star-Lord': ['Hela', 'Hawkeye', 'The Punisher', 'Black Widow', 'Namor'],
  Storm: ['Hela', 'Hawkeye', 'The Punisher', 'Black Widow', 'Namor'],
  'The Punisher': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Venom'],
  'The Thing': ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Mantis'],
  Thor: ['Wolverine', 'Hela', 'Hawkeye', 'The Punisher', 'Mantis'],
  Ultron: ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  Venom: ['Wolverine', 'Namor', 'Peni Parker', 'Scarlet Witch', 'Mantis'],
  'White Fox': ['Spider-Man', 'Black Panther', 'Psylocke', 'Magik', 'Hela'],
  'Winter Soldier': ['Namor', 'Scarlet Witch', 'Peni Parker', 'Doctor Strange', 'Mantis'],
  Wolverine: ['Peni Parker', 'The Thing', 'Luna Snow', 'Mantis', 'Scarlet Witch'],
};

const heroes = JSON.parse(readFileSync(heroesPath, 'utf8'));
const heroNames = new Set(heroes.map((hero) => hero.name));
const missingHeroes = heroes
  .map((hero) => hero.name)
  .filter((name) => !counterPicksByHero[name]);
const invalidCounters = Object.entries(counterPicksByHero)
  .flatMap(([heroName, counters]) =>
    counters
      .filter((counter) => !heroNames.has(counter))
      .map((counter) => `${heroName} -> ${counter}`),
  );

if (missingHeroes.length > 0 || invalidCounters.length > 0) {
  throw new Error([
    missingHeroes.length ? `Missing counter maps: ${missingHeroes.join(', ')}` : '',
    invalidCounters.length ? `Invalid counter names: ${invalidCounters.join(', ')}` : '',
  ].filter(Boolean).join('\n'));
}

const updatedHeroes = heroes.map((hero) => ({
  ...hero,
  counters: counterPicksByHero[hero.name],
}));

writeFileSync(heroesPath, `${JSON.stringify(updatedHeroes, null, 2)}\n`);

const db = createTursoClient();
const updatedAt = new Date().toISOString();

for (const hero of updatedHeroes) {
  await db.execute('UPDATE heroes SET raw_json = ?, updated_at = ? WHERE id = ?', [
    JSON.stringify(hero),
    updatedAt,
    hero.id,
  ]);
  await db.execute('DELETE FROM hero_list_items WHERE hero_id = ? AND item_type = ?', [
    hero.id,
    'counter',
  ]);

  for (const [index, counter] of hero.counters.entries()) {
    await db.execute(
      `INSERT INTO hero_list_items (hero_id, item_type, value, sort_order)
      VALUES (?, ?, ?, ?)`,
      [hero.id, 'counter', counter, index],
    );
  }
}

db.close();

console.log(`Updated counter picks for ${updatedHeroes.length} heroes.`);
