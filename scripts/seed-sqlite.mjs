import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const databasePath = join(projectRoot, 'data', 'marvel-rivals-coach.db');
const schemaPath = join(__dirname, 'sqlite-schema.sql');
const heroesPath = join(projectRoot, 'src', 'app', 'data', 'heroes.mock.json');
const glossaryPath = join(projectRoot, 'src', 'app', 'data', 'glossary.mock.json');

mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
const schema = readFileSync(schemaPath, 'utf8');
const heroes = JSON.parse(readFileSync(heroesPath, 'utf8'));
const glossaryTerms = JSON.parse(readFileSync(glossaryPath, 'utf8'));

db.exec(schema);
db.exec('PRAGMA foreign_keys = ON;');

const insertHero = db.prepare(`
  INSERT INTO heroes (
    id, name, role, difficulty, summary, playstyle, image_url, raw_json, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);
const insertHeroListItem = db.prepare(`
  INSERT INTO hero_list_items (hero_id, item_type, value, sort_order)
  VALUES (?, ?, ?, ?)
`);
const insertHeroAbility = db.prepare(`
  INSERT INTO hero_abilities (
    hero_id, kit_role, kit_label, name, ability_type, description, sort_order
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertGlossaryTerm = db.prepare(`
  INSERT INTO glossary_terms (
    id, term, category, definition, coach_note, example, related_terms_json,
    source_name, source_url, raw_json, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

function seed() {
  db.exec('BEGIN;');

  try {
  db.exec(`
    DELETE FROM hero_abilities;
    DELETE FROM hero_list_items;
    DELETE FROM heroes;
    DELETE FROM glossary_terms;
  `);

  for (const hero of heroes) {
    insertHero.run(
      hero.id,
      hero.name,
      hero.role,
      hero.difficulty,
      hero.summary,
      hero.playstyle,
      hero.imageUrl,
      JSON.stringify(hero),
    );

    insertListItems(hero.id, 'strength', hero.strengths);
    insertListItems(hero.id, 'weakness', hero.weaknesses);
    insertListItems(hero.id, 'counter', hero.counters);
    insertListItems(hero.id, 'synergy', hero.synergies);

    insertAbilities(hero.id, null, null, hero.abilities);

    for (const kit of hero.roleAbilityKits ?? []) {
      insertAbilities(hero.id, kit.role, kit.label, kit.abilities);
    }
  }

  for (const term of glossaryTerms) {
    insertGlossaryTerm.run(
      term.id,
      term.term,
      term.category,
      term.definition,
      term.coachNote,
      term.example,
      JSON.stringify(term.relatedTerms ?? []),
      term.sourceName,
      term.sourceUrl,
      JSON.stringify(term),
    );
  }
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

function insertListItems(heroId, itemType, values = []) {
  values.forEach((value, index) => {
    insertHeroListItem.run(heroId, itemType, value, index);
  });
}

function insertAbilities(heroId, kitRole, kitLabel, abilities = []) {
  abilities.forEach((ability, index) => {
    insertHeroAbility.run(
      heroId,
      kitRole,
      kitLabel,
      ability.name,
      ability.type,
      ability.description,
      index,
    );
  });
}

seed();

const heroCount = db.prepare('SELECT COUNT(*) AS count FROM heroes').get().count;
const glossaryCount = db.prepare('SELECT COUNT(*) AS count FROM glossary_terms').get().count;
const abilityCount = db.prepare('SELECT COUNT(*) AS count FROM hero_abilities').get().count;

db.close();

console.log(`Seeded SQLite database: ${databasePath}`);
console.log(`Heroes: ${heroCount}`);
console.log(`Hero abilities: ${abilityCount}`);
console.log(`Glossary terms: ${glossaryCount}`);
