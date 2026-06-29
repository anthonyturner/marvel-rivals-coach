import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildHeroBuildProfile, buildProfileRationale } from './hero-build-profile-utils.mjs';
import { buildHeroPlaystyle } from './playstyle-utils.mjs';
import { columnExists, createTursoClient, executeSchema } from './turso-client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const schemaPath = join(__dirname, 'sqlite-schema.sql');
const heroImagesPath = join(projectRoot, 'src', 'public', 'images', 'heroes');
const fandomApi = 'https://marvelrivals.fandom.com/api.php';

const excludedTitles = new Set([
  'Heroes',
  'Minor Characters',
  'Ultron Drone',
]);

const db = createTursoClient();
await executeSchema(db, readFileSync(schemaPath, 'utf8'));
await migrateAbilityTechnicalDetails();

const startedAt = new Date().toISOString();
const runId = await insertSyncRun('fandom-heroes', 'running', 'Syncing Fandom hero pages', startedAt);

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

      await saveHero(hero);
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

  await upsertSource(
    'fandom-heroes',
    'Marvel Rivals Fandom Heroes',
    `${fandomApi}?action=query&list=categorymembers&cmtitle=Category:Heroes`,
    JSON.stringify(payload),
    finishedAt,
    'success',
    null,
  );
  await finishSyncRun(
    runId,
    'success',
    `Synced ${synced.length} heroes. Skipped ${skipped.length}.`,
    finishedAt,
  );

  console.log(`Hero sync complete. Synced ${synced.length}; skipped ${skipped.length}.`);
} catch (error) {
  const finishedAt = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);

  await upsertSource('fandom-heroes', 'Marvel Rivals Fandom Heroes', fandomApi, '{}', finishedAt, 'error', message);
  await finishSyncRun(runId, 'error', message, finishedAt);
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
  const existing = await getExistingHero(id);
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
    overview: getFullOverview(text, pageTitle, role),
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

async function saveHero(hero) {
  const heroWithBuildProfile = withBuildProfile(hero);

  await upsertHero(heroWithBuildProfile);
  await db.execute('DELETE FROM hero_list_items WHERE hero_id = ?', [hero.id]);
  await db.execute('DELETE FROM hero_abilities WHERE hero_id = ?', [hero.id]);
  await insertListItems(heroWithBuildProfile.id, 'strength', heroWithBuildProfile.strengths);
  await insertListItems(heroWithBuildProfile.id, 'weakness', heroWithBuildProfile.weaknesses);
  await insertListItems(heroWithBuildProfile.id, 'counter', heroWithBuildProfile.counters);
  await insertListItems(heroWithBuildProfile.id, 'synergy', heroWithBuildProfile.synergies);
  await insertAbilities(heroWithBuildProfile.id, null, null, heroWithBuildProfile.abilities);

  for (const kit of heroWithBuildProfile.roleAbilityKits ?? []) {
    await insertAbilities(heroWithBuildProfile.id, kit.role, kit.label, kit.abilities);
  }
}

function withBuildProfile(hero) {
  const buildProfile = buildHeroBuildProfile(hero);

  return {
    ...hero,
    buildProfile,
    buildProfileRationale: buildProfileRationale(hero, buildProfile),
  };
}

async function getExistingHero(heroId) {
  const result = await db.execute('SELECT raw_json FROM heroes WHERE id = ?', [heroId]);

  return result.rows[0];
}

async function upsertHero(hero) {
  await db.execute(
    `INSERT INTO heroes (
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
      updated_at = CURRENT_TIMESTAMP`,
    [
      hero.id,
      hero.name,
      hero.role,
      hero.difficulty,
      hero.summary,
      hero.playstyle,
      hero.imageUrl,
      JSON.stringify(hero),
    ],
  );
}

async function insertSyncRun(sourceKey, status, message, startedAt) {
  const result = await db.execute(
    `INSERT INTO sync_runs (source_key, status, message, started_at)
    VALUES (?, ?, ?, ?)`,
    [sourceKey, status, message, startedAt],
  );

  return Number(result.lastInsertRowid);
}

async function finishSyncRun(runId, status, message, finishedAt) {
  await db.execute(
    `UPDATE sync_runs
    SET status = ?, message = ?, finished_at = ?
    WHERE id = ?`,
    [status, message, finishedAt, runId],
  );
}

async function upsertSource(sourceKey, sourceName, url, payloadJson, fetchedAt, status, error) {
  await db.execute(
    `INSERT INTO external_sources (
      source_key, source_name, url, payload_json, fetched_at, status, error
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_key) DO UPDATE SET
      source_name = excluded.source_name,
      url = excluded.url,
      payload_json = excluded.payload_json,
      fetched_at = excluded.fetched_at,
      status = excluded.status,
      error = excluded.error`,
    [sourceKey, sourceName, url, payloadJson, fetchedAt, status, error],
  );
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

function getFullOverview(text, name, role) {
  const overview = text.match(/==\s*Overview\s*==\s*(.*?)(?=\n==\s*[^=]|\n$)/s);

  if (!overview) {
    return getOfficialSummary(text, name, role);
  }

  const sections = [...overview[1].matchAll(/===\s*([^=]+?)\s*===\s*(.*?)(?=\n===|\n==|$)/gs)]
    .map((section) => {
      const title = removeWikiMarkup(section[1]);
      const body = section[2]
        .split('\n')
        .map((line) => removeWikiMarkup(line.replace(/^\*\s*/, '')))
        .filter(Boolean)
        .join(' ');

      return title && body ? `${title}: ${body}` : body;
    })
    .filter(Boolean);
  const overviewBody = sections.length > 0 ? sections.join(' ') : removeWikiMarkup(overview[1]);

  return overviewBody || getOfficialSummary(text, name, role);
}

function getSectionBullets(text, sectionName, take = 3) {
  const section = text.match(new RegExp(`==\\s*Overview\\s*==.*?===\\s*${escapeRegExp(sectionName)}\\s*===\\s*(.*?)(?=\\n===|\\n==)`, 's'));

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
    abilities: mergeDeadpoolRoleKitAbilities(kit.abilities, roleAbilities.get(kit.role) ?? []),
  }));
}

function mergeDeadpoolRoleKitAbilities(kitAbilities, fandomAbilities) {
  const mergedAbilities = uniqueAbilitiesByName(kitAbilities.map((ability) => {
    const fandomAbility = findDeadpoolAbility(fandomAbilities, ability.name);

    return fandomAbility
      ? {
          ...ability,
          description: fandomAbility.description || ability.description,
          technicalDetails: fandomAbility.technicalDetails ?? ability.technicalDetails ?? [],
        }
      : ability;
  }));
  const missingPassives = uniqueAbilitiesByName(fandomAbilities).filter((ability) =>
    ability.type === 'Passive' &&
    !mergedAbilities.some((mergedAbility) =>
      normalizeDeadpoolAbilityName(mergedAbility.name) === normalizeDeadpoolAbilityName(ability.name),
    ),
  );

  return [
    ...mergedAbilities,
    ...missingPassives,
  ];
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

function uniqueAbilitiesByName(abilities) {
  const seen = new Set();
  const unique = [];

  for (const ability of abilities) {
    const key = normalizeDeadpoolAbilityName(ability.name);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(ability);
  }

  return unique;
}

function findDeadpoolAbility(roleAbilities, kitAbilityName) {
  const normalizedKitName = normalizeDeadpoolAbilityName(kitAbilityName);
  const exactMatches = roleAbilities.filter((ability) => normalizeDeadpoolAbilityName(ability.name) === normalizedKitName);

  if (exactMatches.length > 0) {
    return mergeDeadpoolAbilityMatches(exactMatches);
  }

  const partialMatches = roleAbilities.filter((ability) => {
    const normalizedAbilityName = normalizeDeadpoolAbilityName(ability.name);

    return normalizedAbilityName.includes(normalizedKitName) || normalizedKitName.includes(normalizedAbilityName);
  });

  return partialMatches.length > 0 ? mergeDeadpoolAbilityMatches(partialMatches) : undefined;
}

function mergeDeadpoolAbilityMatches(matches) {
  const base = matches.find((ability) => !isUpgradedDeadpoolAbility(ability.name)) ?? matches[0];
  const upgraded = matches.find((ability) => isUpgradedDeadpoolAbility(ability.name));

  if (!upgraded || upgraded === base) {
    return base;
  }

  const baseDescription = base.description ?? '';
  const upgradedDescription = upgraded.description ?? '';
  const description = upgradedDescription && upgradedDescription !== baseDescription
    ? mergeDeadpoolAbilityDescriptions(base, upgradedDescription)
    : baseDescription;

  return {
    ...base,
    description,
    technicalDetails: mergeTechnicalDetails(base.technicalDetails ?? [], upgraded.technicalDetails ?? []),
  };
}

function mergeDeadpoolAbilityDescriptions(base, upgradedDescription) {
  const baseDescription = base.description ?? '';
  const normalizedName = normalizeDeadpoolAbilityName(base.name);

  if (normalizedName === 'skill issue') {
    return `${baseDescription} Upgraded: Adds continuous damage during the taunt. If the enemy misses with an ability during the effect, they suffer extra damage and Vulnerability.`;
  }

  const upgradedDelta = removeRepeatedOpeningClause(baseDescription, upgradedDescription);

  return upgradedDelta
    ? `${baseDescription} Upgraded: ${upgradedDelta}`
    : baseDescription;
}

function removeRepeatedOpeningClause(baseDescription, upgradedDescription) {
  const baseOpening = baseDescription.split(/[.!?]/)[0]?.trim();

  if (!baseOpening || !upgradedDescription.toLowerCase().startsWith(baseOpening.toLowerCase())) {
    return upgradedDescription;
  }

  return upgradedDescription
    .slice(baseOpening.length)
    .replace(/^[\s,.;:-]+/, '')
    .replace(/^[a-z]/, (letter) => letter.toUpperCase())
    .trim();
}

function mergeTechnicalDetails(baseDetails, upgradedDetails) {
  const merged = [];

  for (const detail of baseDetails) {
    addTechnicalDetail(merged, detail);
  }

  for (const detail of upgradedDetails) {
    addTechnicalDetail(merged, detail, 'Upgraded ');
  }

  return merged;
}

function addTechnicalDetail(details, detail, conflictPrefix = '') {
  const existing = details.find((item) => item.label.toLowerCase() === detail.label.toLowerCase());

  if (!existing) {
    details.push(detail);
    return;
  }

  if (existing.value === detail.value) {
    return;
  }

  details.push({
    label: `${conflictPrefix}${detail.label}`,
    value: detail.value,
  });
}

function isUpgradedDeadpoolAbility(value) {
  return /\bupgraded\b/i.test(value);
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

  if (/^special effect\b/i.test(cleaned)) {
    const value = cleaned.replace(/^special effect\s*/i, '').trim();

    return value ? { label: 'Special Effect', value } : undefined;
  }
  const match = cleaned.match(/^(.+?)\s*[-–]\s*(.+)$/);

  if (!match) {
    return undefined;
  }

  const label = toTitleCase(match[1].replace(/[:：]+$/g, '').trim());
  const value = match[2].trim();
  const normalizedLabel = label.replace(/\bRation\b/g, 'Ratio');

  return normalizedLabel && value ? { label: normalizedLabel, value } : undefined;
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

async function migrateAbilityTechnicalDetails() {
  if (!(await columnExists(db, 'hero_abilities', 'technical_details_json'))) {
    await db.execute("ALTER TABLE hero_abilities ADD COLUMN technical_details_json TEXT NOT NULL DEFAULT '[]'");
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
