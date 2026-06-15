import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildHeroPlaystyle, isGenericPlaystyle } from './playstyle-utils.mjs';
import { columnExists, createTursoClient, executeSchema } from './turso-client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const schemaPath = join(__dirname, 'sqlite-schema.sql');
const heroesPath = join(projectRoot, 'src', 'app', 'data', 'heroes.mock.json');
const glossaryPath = join(projectRoot, 'src', 'app', 'data', 'glossary.mock.json');

const db = createTursoClient();
const schema = readFileSync(schemaPath, 'utf8');
const heroes = JSON.parse(readFileSync(heroesPath, 'utf8'));
const glossaryTerms = JSON.parse(readFileSync(glossaryPath, 'utf8'));

await executeSchema(db, schema);
await migrateAbilityTechnicalDetails();
await seed();

const heroCount = await getCount('heroes');
const glossaryCount = await getCount('glossary_terms');
const abilityCount = await getCount('hero_abilities');

db.close();

console.log('Seeded Turso database.');
console.log(`Heroes: ${heroCount}`);
console.log(`Hero abilities: ${abilityCount}`);
console.log(`Glossary terms: ${glossaryCount}`);

async function seed() {
  await db.execute('DELETE FROM hero_abilities');
  await db.execute('DELETE FROM hero_list_items');
  await db.execute('DELETE FROM heroes');
  await db.execute('DELETE FROM glossary_terms');

  for (const hero of heroes) {
    const seededHero = {
      ...hero,
      playstyle: isGenericPlaystyle(hero.playstyle) ? buildHeroPlaystyle(hero) : hero.playstyle,
    };

    await db.execute(
      `INSERT INTO heroes (
        id, name, role, difficulty, summary, playstyle, image_url, raw_json, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        seededHero.id,
        seededHero.name,
        seededHero.role,
        seededHero.difficulty,
        seededHero.summary,
        seededHero.playstyle,
        seededHero.imageUrl,
        JSON.stringify(seededHero),
      ],
    );

    await insertListItems(seededHero.id, 'strength', seededHero.strengths);
    await insertListItems(seededHero.id, 'weakness', seededHero.weaknesses);
    await insertListItems(seededHero.id, 'counter', seededHero.counters);
    await insertListItems(seededHero.id, 'synergy', seededHero.synergies);
    await insertAbilities(seededHero.id, null, null, seededHero.abilities);

    for (const kit of seededHero.roleAbilityKits ?? []) {
      await insertAbilities(seededHero.id, kit.role, kit.label, kit.abilities);
    }
  }

  for (const term of glossaryTerms) {
    await db.execute(
      `INSERT INTO glossary_terms (
        id, term, category, definition, coach_note, example, related_terms_json,
        source_name, source_url, raw_json, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
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
      ],
    );
  }
}

async function insertListItems(heroId, itemType, values = []) {
  for (const [index, value] of values.entries()) {
    await db.execute(
      `INSERT INTO hero_list_items (hero_id, item_type, value, sort_order)
      VALUES (?, ?, ?, ?)`,
      [heroId, itemType, value, index],
    );
  }
}

async function insertAbilities(heroId, kitRole, kitLabel, abilities = []) {
  for (const [index, ability] of abilities.entries()) {
    await db.execute(
      `INSERT INTO hero_abilities (
        hero_id, kit_role, kit_label, name, ability_type, description, technical_details_json, sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        heroId,
        kitRole,
        kitLabel,
        ability.name,
        ability.type,
        ability.description,
        JSON.stringify(ability.technicalDetails ?? []),
        index,
      ],
    );
  }
}

async function migrateAbilityTechnicalDetails() {
  if (!(await columnExists(db, 'hero_abilities', 'technical_details_json'))) {
    await db.execute("ALTER TABLE hero_abilities ADD COLUMN technical_details_json TEXT NOT NULL DEFAULT '[]'");
  }
}

async function getCount(tableName) {
  const result = await db.execute(`SELECT COUNT(*) AS count FROM ${tableName}`);

  return result.rows[0]?.count ?? 0;
}
