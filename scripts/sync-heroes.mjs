import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import { buildHeroPlaystyle } from './playstyle-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const databasePath = join(projectRoot, 'data', 'marvel-rivals-coach.db');
const schemaPath = join(__dirname, 'sqlite-schema.sql');
const heroImagesPath = join(projectRoot, 'src', 'public', 'images', 'heroes');
const fandomApi = 'https://marvelrivals.fandom.com/api.php';

const excludedTitles = new Set([
  'Heroes',
  'Minor Characters',
  'Ultron Drone',
]);

mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(readFileSync(schemaPath, 'utf8'));
db.exec('PRAGMA foreign_keys = ON;');
migrateAbilityTechnicalDetails();

const getExistingHero = db.prepare('SELECT raw_json FROM heroes WHERE id = ?');
const upsertHero = db.prepare(`
  INSERT INTO heroes (
    id, name, role, difficulty, summary, playstyle, image_url, raw_json, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    role = excluded.role,
    difficulty = excluded.difficulty,
    summary = excluded.summary,
    playstyle = excluded.playstyle,
    image_url = excluded.image_url,
    raw_json = excluded.raw_json,
    updated_at = CURRENT_TIMESTAMP
`);
const deleteHeroItems = db.prepare('DELETE FROM hero_list_items WHERE hero_id = ?');
const deleteHeroAbilities = db.prepare('DELETE FROM hero_abilities WHERE hero_id = ?');
const insertHeroListItem = db.prepare(`
  INSERT INTO hero_list_items (hero_id, item_type, value, sort_order)
  VALUES (?, ?, ?, ?)
`);
const insertHeroAbility = db.prepare(`
  INSERT INTO hero_abilities (
    hero_id, kit_role, kit_label, name, ability_type, description, technical_details_json, sort_order
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
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

const startedAt = new Date().toISOString();
const run = insertSyncRun.run('fandom-heroes', 'running', 'Syncing Fandom hero pages', startedAt);
const runId = run.lastInsertRowid;

try {
  const heroPages = await getHeroPages();
  const synced = [];
  const skipped = [];

  for (const page of heroPages) {
    try {
      const hero = await buildHero(page.title);

      if (!hero) {
        skipped.push(page.title);
        continue;
      }

      saveHero(hero);
      synced.push(hero.name);
      console.log(`Synced hero: ${hero.name}`);
    } catch (error) {
      skipped.push(`${page.title}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const finishedAt = new Date().toISOString();
  const payload = {
    synced,
    skipped,
    heroPages,
  };

  upsertSource.run(
    'fandom-heroes',
    'Marvel Rivals Fandom Heroes',
    `${fandomApi}?action=query&list=categorymembers&cmtitle=Category:Heroes`,
    JSON.stringify(payload),
    finishedAt,
    'success',
    null,
  );
  finishSyncRun.run(
    'success',
    `Synced ${synced.length} heroes. Skipped ${skipped.length}.`,
    finishedAt,
    runId,
  );

  console.log(`Hero sync complete. Synced ${synced.length}; skipped ${skipped.length}.`);
} catch (error) {
  const finishedAt = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);

  upsertSource.run('fandom-heroes', 'Marvel Rivals Fandom Heroes', fandomApi, '{}', finishedAt, 'error', message);
  finishSyncRun.run('error', message, finishedAt, runId);
  throw error;
} finally {
  db.close();
}

async function getHeroPages() {
  const pages = [];
  let cmcontinue;

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: 'Category:Heroes',
      cmlimit: '100',
      format: 'json',
      origin: '*',
    });

    if (cmcontinue) {
      params.set('cmcontinue', cmcontinue);
    }

    const payload = await fetchJson(`${fandomApi}?${params.toString()}`);
    pages.push(
      ...(payload.query?.categorymembers ?? [])
        .filter((page) => page.ns === 0)
        .filter((page) => !excludedTitles.has(page.title)),
    );
    cmcontinue = payload.continue?.cmcontinue;
  } while (cmcontinue);

  return pages;
}

async function buildHero(pageTitle) {
  const text = await getWikiText(pageTitle);
  const role = normalizeRole(getField(text, 'role'));

  if (!role) {
    return undefined;
  }

  const id = slugify(pageTitle);
  const existing = getExistingHero.get(id);
  const existingHero = existing ? JSON.parse(existing.raw_json) : undefined;
  const difficulty = parseDifficulty(getField(text, 'difficulty'));
  const strengths = getSectionBullets(text, 'Strengths');
  const weaknesses = getSectionBullets(text, 'Weaknesses');
  const synergies = getSynergies(text);
  const abilities = await getAbilities(pageTitle);

  const roleAbilityKits = id === 'deadpool' && existingHero?.roleAbilityKits
    ? await enrichDeadpoolRoleAbilityKits(existingHero.roleAbilityKits)
    : existingHero?.roleAbilityKits;

  const syncedHero = {
    id,
    name: pageTitle,
    role,
    difficulty,
    summary: getOfficialSummary(text, pageTitle, role),
    strengths: strengths.length > 0 ? strengths : fallbackStrengths(role),
    weaknesses: weaknesses.length > 0 ? weaknesses : fallbackWeaknesses(role),
    counters: existingHero?.counters?.length > 0 ? existingHero.counters : getFallbackCounters(role),
    synergies: synergies.length > 0 ? synergies : fallbackSynergies(role),
    abilities: abilities.length > 0 ? abilities : existingHero?.abilities ?? [],
    roleAbilityKits,
    imageUrl: getImageUrl(id, existingHero?.imageUrl),
  };

  return mergeHero(existingHero, {
    ...syncedHero,
    playstyle: buildHeroPlaystyle(syncedHero),
  });
}

function mergeHero(existingHero, syncedHero) {
  if (!existingHero) {
    return syncedHero;
  }

  return {
    ...existingHero,
    ...syncedHero,
    roleAbilityKits: syncedHero.roleAbilityKits ?? existingHero.roleAbilityKits,
    imageUrl: existingHero.imageUrl && !existingHero.imageUrl.includes('default-hero')
      ? existingHero.imageUrl
      : syncedHero.imageUrl,
  };
}

function saveHero(hero) {
  db.exec('BEGIN;');

  try {
    upsertHero.run(
      hero.id,
      hero.name,
      hero.role,
      hero.difficulty,
      hero.summary,
      hero.playstyle,
      hero.imageUrl,
      JSON.stringify(hero),
    );
    deleteHeroItems.run(hero.id);
    deleteHeroAbilities.run(hero.id);
    insertListItems(hero.id, 'strength', hero.strengths);
    insertListItems(hero.id, 'weakness', hero.weaknesses);
    insertListItems(hero.id, 'counter', hero.counters);
    insertListItems(hero.id, 'synergy', hero.synergies);
    insertAbilities(hero.id, null, null, hero.abilities);

    for (const kit of hero.roleAbilityKits ?? []) {
      insertAbilities(hero.id, kit.role, kit.label, kit.abilities);
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
      JSON.stringify(ability.technicalDetails ?? []),
      index,
    );
  });
}

async function getWikiText(pageTitle) {
  const params = new URLSearchParams({
    action: 'parse',
    page: pageTitle,
    prop: 'wikitext',
    format: 'json',
    origin: '*',
  });
  const payload = await fetchJson(`${fandomApi}?${params.toString()}`);

  return payload.parse?.wikitext?.['*'] ?? '';
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'marvel-rivals-coach-hero-sync/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function getField(text, field) {
  const match = text.match(new RegExp(`^\\|\\s*${escapeRegExp(field)}\\s*=\\s*(.+)$`, 'm'));

  return match ? removeWikiMarkup(match[1]) : '';
}

function normalizeRole(value) {
  const text = removeWikiMarkup(value);
  const roles = ['Vanguard', 'Duelist', 'Strategist'].filter((role) => text.includes(role));

  if (roles.length > 1) {
    return 'Multi-Role';
  }

  return roles[0] ?? undefined;
}

function parseDifficulty(value) {
  const difficulty = Number.parseInt(value, 10);

  return Number.isFinite(difficulty) ? difficulty : 3;
}

function getOfficialSummary(text, name, role) {
  const quote = text.match(/\{\{Quote\|(.+?)\|Official description\}\}/s);

  if (quote) {
    return removeWikiMarkup(quote[1]);
  }

  return `${name} is a ${role} hero in Marvel Rivals.`;
}

function getSectionBullets(text, sectionName, take = 3) {
  const section = text.match(new RegExp(`==Overview==.*?===${escapeRegExp(sectionName)}===\\s*(.*?)(?=\\n===|\\n==)`, 's'));

  if (!section) {
    return [];
  }

  return section[1]
    .split('\n')
    .map((line) => line.match(/^\*\s+(.+)/)?.[1])
    .filter(Boolean)
    .map((line) => firstSentence(removeWikiMarkup(line)))
    .filter(Boolean)
    .slice(0, take);
}

async function getAbilities(pageTitle) {
  let templateText = await getWikiText(`Template:Abilities/${pageTitle}`);

  if (!templateText) {
    return [];
  }

  const references = [...templateText.matchAll(/SkillTable\|(?:1=)?([^}|]+)/g)];

  if (references.length > 0 && !/^\s*\|name\s*=/m.test(templateText)) {
    const merged = [];

    for (const reference of references) {
      const target = reference[1].trim();
      const targetText = await getWikiText(`Template:${target}`);

      if (targetText) {
        merged.push(targetText);
      }
    }

    if (merged.length > 0) {
      templateText = merged.join('\n');
    }
  }

  const abilities = parseAbilities(templateText);

  return abilities;
}

async function enrichDeadpoolRoleAbilityKits(roleAbilityKits) {
  const roleAbilities = await getDeadpoolRoleAbilities();

  return roleAbilityKits.map((kit) => ({
    ...kit,
    abilities: kit.abilities.map((ability) => {
      const details = findDeadpoolTechnicalDetails(roleAbilities.get(kit.role) ?? [], ability.name);

      return details.length > 0
        ? {
            ...ability,
            technicalDetails: details,
          }
        : ability;
    }),
  }));
}

async function getDeadpoolRoleAbilities() {
  const templateText = await getWikiText('Template:Abilities/Deadpool');
  const references = [...templateText.matchAll(/SkillTable\|(?:1=)?([^}|]+)/g)]
    .map((reference) => reference[1].trim())
    .filter((reference) => /Abilities\/Deadpool\//.test(reference));
  const roleAbilities = new Map();

  for (const reference of references) {
    const role = reference.match(/Abilities\/Deadpool\/([^/]+)/)?.[1];
    const targetText = await getWikiText(`Template:${reference}`);

    if (!role || !targetText) {
      continue;
    }

    roleAbilities.set(role, [...(roleAbilities.get(role) ?? []), ...parseAbilities(targetText)]);
  }

  return roleAbilities;
}

function findDeadpoolTechnicalDetails(roleAbilities, kitAbilityName) {
  const normalizedKitName = normalizeDeadpoolAbilityName(kitAbilityName);
  const exact = roleAbilities.find((ability) => normalizeDeadpoolAbilityName(ability.name) === normalizedKitName);

  if (exact?.technicalDetails?.length > 0) {
    return exact.technicalDetails;
  }

  const partial = roleAbilities.find((ability) => {
    const normalizedAbilityName = normalizeDeadpoolAbilityName(ability.name);

    return normalizedAbilityName.includes(normalizedKitName) || normalizedKitName.includes(normalizedAbilityName);
  });

  return partial?.technicalDetails ?? [];
}

function normalizeDeadpoolAbilityName(value) {
  return removeWikiMarkup(value)
    .toLowerCase()
    .replace(/\bhijinks\b/g, 'hijinx')
    .replace(/\bkatana\b/g, 'katanas')
    .replace(/\s+-\s+(vanguard|duelist|strategist)(\s+upgraded)?$/i, '')
    .replace(/\s+-\s+upgraded$/i, '')
    .replace(/\bupgraded\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAbilities(templateText) {
  let currentType = 'Ability';
  const abilities = [];
  let readingDescription = false;
  let descriptionLines = [];

  function finishDescription() {
    if (!readingDescription || abilities.length === 0) {
      return;
    }

    const ability = abilities[abilities.length - 1];
    const parsedDescription = splitAbilityDescription(descriptionLines.join('\n'));

    ability.description = parsedDescription.summary;
    ability.technicalDetails = parsedDescription.technicalDetails;
    readingDescription = false;
    descriptionLines = [];
  }

  for (const line of templateText.split('\n')) {
    if (readingDescription) {
      if (/^\s*\}\}/.test(line)) {
        finishDescription();
        continue;
      }

      descriptionLines.push(line);
      continue;
    }

    const title = line.match(/\{\{Skill\/Title\|([^}]+)\}\}/);

    if (title) {
      finishDescription();
      currentType = normalizeAbilitySection(removeWikiMarkup(title[1]));
      continue;
    }

    const name = line.match(/^\s*\|name\s*=\s*(.+)$/);

    if (name) {
      finishDescription();
      const cleanName = removeWikiMarkup(name[1]);

      if (cleanName) {
        abilities.push({
          name: cleanName,
          type: currentType,
          description: '',
          technicalDetails: [],
          key: '',
        });
      }

      continue;
    }

    const key = line.match(/^\s*\|key\s*=\s*(.+)$/);

    if (key && abilities.length > 0) {
      const ability = abilities[abilities.length - 1];
      ability.key = removeWikiMarkup(key[1]);
      ability.type = normalizeAbilityType(currentType, ability.key);
      continue;
    }

    const description = line.match(/^\s*\|description\s*=\s*(.+)$/);

    if (description && abilities.length > 0) {
      readingDescription = true;
      descriptionLines = [description[1]];
    }
  }

  finishDescription();

  return abilities.map(({ key, ...ability }) => ability);
}

function splitAbilityDescription(descriptionBlock) {
  const sections = descriptionBlock.split(/\n\s*----\s*\n/g);
  const summary = removeWikiMarkup(sections[0]);
  const technicalDetails = sections
    .slice(1)
    .map(parseTechnicalDetail)
    .filter(Boolean);

  return {
    summary,
    technicalDetails,
  };
}

function parseTechnicalDetail(section) {
  const cleaned = removeWikiMarkup(section)
    .replace(/^[\s-]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const match = cleaned.match(/^(.+?)\s*[-–]\s*(.+)$/);

  if (!match) {
    return undefined;
  }

  const label = toTitleCase(match[1].replace(/[:：]+$/g, '').trim());
  const value = match[2].trim();

  return label && value ? { label, value } : undefined;
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function migrateAbilityTechnicalDetails() {
  const columns = db.prepare('PRAGMA table_info(hero_abilities)').all();
  const hasTechnicalDetails = columns.some((column) => column.name === 'technical_details_json');

  if (!hasTechnicalDetails) {
    db.exec("ALTER TABLE hero_abilities ADD COLUMN technical_details_json TEXT NOT NULL DEFAULT '[]';");
  }
}

function normalizeAbilitySection(value) {
  if (/normal attack/i.test(value)) {
    return 'Normal Attack';
  }

  if (/team-up/i.test(value)) {
    return 'Team-Up Ability';
  }

  if (/ultimate/i.test(value)) {
    return 'Ultimate';
  }

  return 'Ability';
}

function normalizeAbilityType(sectionType, key = '') {
  if (sectionType === 'Team-Up Ability' || sectionType === 'Normal Attack' || sectionType === 'Ultimate') {
    return sectionType;
  }

  if (/\bq\b|l3\s*\+\s*r3/i.test(key)) {
    return 'Ultimate';
  }

  if (/passive/i.test(key)) {
    return 'Passive';
  }

  return 'Ability';
}

function getSynergies(text) {
  const synergies = [];
  const teamUps = [...text.matchAll(/— with ([^\n]+)/g)];

  for (const teamUp of teamUps) {
    const names = removeWikiMarkup(teamUp[1]).split(/\s+and\s+|,\s*/);

    for (const name of names) {
      const cleanName = name.trim();

      if (cleanName && !synergies.includes(cleanName)) {
        synergies.push(cleanName);
      }
    }
  }

  return synergies.slice(0, 3);
}

function getFallbackCounters(role) {
  switch (role) {
    case 'Vanguard':
      return ['Long-range poke', 'High-mobility duelists', 'Sustained anti-shield pressure'];
    case 'Strategist':
      return ['Dive pressure', 'Line-of-sight denial', 'Burst focus'];
    case 'Multi-Role':
      return ['Cooldown tracking', 'Role mismatch pressure', 'Coordinated focus fire'];
    default:
      return ['Crowd control', 'Protective barriers', 'Focused peel'];
  }
}

function fallbackStrengths(role) {
  switch (role) {
    case 'Vanguard':
      return ['Creates space for the team', 'Absorbs pressure', 'Controls close fights'];
    case 'Strategist':
      return ['Supports allies', 'Stabilizes team fights', 'Adds utility from the backline'];
    case 'Multi-Role':
      return ['Adapts to different team needs', 'Changes role profile', 'Flexible fight planning'];
    default:
      return ['Deals reliable damage', 'Pressures exposed targets', 'Creates elimination windows'];
  }
}

function fallbackWeaknesses(role) {
  switch (role) {
    case 'Vanguard':
      return ['Can be kited', 'Punished by split angles', 'Needs support timing'];
    case 'Strategist':
      return ['Vulnerable to dives', 'Needs safe positioning', 'Struggles when isolated'];
    case 'Multi-Role':
      return ['Requires role awareness', 'Can be punished during swaps', 'Needs cooldown discipline'];
    default:
      return ['Punished by crowd control', 'Needs clean angles', 'Can struggle into heavy peel'];
  }
}

function fallbackSynergies(role) {
  switch (role) {
    case 'Vanguard':
      return ['Strategists', 'Backline duelists', 'Area damage heroes'];
    case 'Strategist':
      return ['Vanguards', 'Dive duelists', 'Sustained damage heroes'];
    case 'Multi-Role':
      return ['Flexible team comps', 'Frontline anchors', 'Tempo supports'];
    default:
      return ['Vanguards', 'Strategists', 'Crowd-control heroes'];
  }
}

function getImageUrl(heroId, existingImageUrl) {
  if (existingImageUrl && !existingImageUrl.includes('default-hero')) {
    return existingImageUrl;
  }

  const pngPath = join(heroImagesPath, `${heroId}.png`);

  return existsSync(pngPath) ? `/images/heroes/${heroId}.png` : '/images/heroes/default-hero.png';
}

function removeWikiMarkup(value = '') {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\{\{ATC\|[^|}]+\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{Audio\|[^}]+\}\}/g, '')
    .replace(/\{\{[^|}]+\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\[\[File:[^\]]+\]\]/g, '')
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(value) {
  const sentence = value.split(/(?<=[.!?])\s+/)[0] ?? '';

  return truncate(sentence, 96);
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
