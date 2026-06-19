export const buildProfileSource = {
  label: 'Marvel Rivals Wiki hero and ability descriptions',
  url: 'https://marvelrivals.fandom.com/wiki/Category:Heroes',
};

const buildTypes = ['Utility', 'Damage', 'Sustain', 'Mobility', 'Ultimate'];

const signalRules = {
  Utility: [
    [/\b(shield|barrier|wall|field|zone|construct|turret|trap|mine|portal|web|smoke)\b/gi, 1.1],
    [/\b(revive|resurrect|cocoon|invincib|immune|cleanse|save|protect|damage reduction)\b/gi, 1.7],
    [/\b(stun|slow|freeze|root|snare|knock|launch|pull|push|taunt|blind|silence|disrupt|interrupt)\b/gi, 1.45],
    [/\b(scan|reveal|detect|mark|vulnerability|weaken|boost|buff|debuff|grant)\b/gi, 1.25],
    [/\b(line of sight|control|deny|block|peel|crowd control|cc)\b/gi, 1.2],
  ],
  Damage: [
    [/\b(damage|damaging|attack|strike|slash|shot|shoot|fire|blast|beam|projectile|explosion|explode)\b/gi, 0.9],
    [/\b(burst|critical|headshot|combo|detonate|execute|pierce|penetrate|bonus damage)\b/gi, 1.35],
    [/\b(vulnerability|damage boost|damage over time|dot|bleed|burn|ignite|poison)\b/gi, 1.25],
    [/\b(eliminate|ko|kill|finish|duel|pressure|poke)\b/gi, 1],
  ],
  Sustain: [
    [/\b(heal|healing|restore|regenerate|recovery|recover|mend|lifesteal|life steal)\b/gi, 1.45],
    [/\b(health|bonus health|overhealth|armor|shield|barrier|damage reduction|mitigate)\b/gi, 1.2],
    [/\b(revive|resurrect|invincib|immune|survive|sustain|save|protect)\b/gi, 1.4],
  ],
  Mobility: [
    [/\b(dash|leap|jump|double jump|swing|fly|flight|hover|glide|soar|teleport|blink|burrow)\b/gi, 1.55],
    [/\b(speed|movement|accelerate|sprint|charge|rush|lunge|launch forward|reposition)\b/gi, 1.2],
    [/\b(vertical|high ground|airborne|ascend|descend|escape|chase|dive)\b/gi, 1.2],
  ],
  Ultimate: [
    [/\b(ultimate|energy cost|ult|teamfight|fight-winning|empowered|transform|summon)\b/gi, 1.4],
    [/\b(revive|resurrect|massive|devastating|unleash|global|large area|area)\b/gi, 0.7],
  ],
};

const roleBase = {
  Vanguard: { Utility: 2.2, Damage: 0.8, Sustain: 2.8, Mobility: 0.9, Ultimate: 0.7 },
  Duelist: { Utility: 0.8, Damage: 3.4, Sustain: 0.5, Mobility: 1.4, Ultimate: 0.7 },
  Strategist: { Utility: 2.6, Damage: 0.8, Sustain: 3.2, Mobility: 0.8, Ultimate: 0.8 },
  'Multi-Role': { Utility: 2.2, Damage: 2.2, Sustain: 2.2, Mobility: 1.6, Ultimate: 0.8 },
};

const roleWeights = {
  Vanguard: { Utility: 1.05, Damage: 0.6, Sustain: 1.18, Mobility: 1, Ultimate: 1 },
  Duelist: { Utility: 0.82, Damage: 1.08, Sustain: 0.72, Mobility: 1.08, Ultimate: 1 },
  Strategist: { Utility: 1.12, Damage: 0.64, Sustain: 1.22, Mobility: 0.92, Ultimate: 1 },
  'Multi-Role': { Utility: 1.08, Damage: 1.08, Sustain: 1.08, Mobility: 1.08, Ultimate: 1.08 },
};

const normalizers = {
  Utility: 24,
  Damage: 30,
  Sustain: 17,
  Mobility: 16,
  Ultimate: 14,
};

export function buildHeroBuildProfile(hero) {
  const scores = emptyProfile();
  addProfile(scores, roleBase[hero.role] ?? roleBase.Duelist);

  const abilityTexts = collectAbilities(hero).map((ability) => abilityText(ability));
  const overviewText = [
    hero.summary,
    hero.playstyle,
    ...(hero.strengths ?? []),
    ...(hero.weaknesses ?? []),
    ...(hero.counters ?? []),
    ...(hero.synergies ?? []),
  ].join(' ');

  scoreText(scores, overviewText, 0.8, 3);

  for (const ability of collectAbilities(hero)) {
    scoreAbility(scores, ability);
  }

  applyAbilityMixBonuses(scores, abilityTexts);
  applyRoleWeights(scores, hero.role);

  return normalizeProfile(scores);
}

export function buildProfileRationale(hero, profile = buildHeroBuildProfile(hero)) {
  const abilities = collectAbilities(hero);
  const ultimateCount = abilities.filter((ability) => isUltimateAbility(ability)).length;
  const passiveCount = abilities.filter((ability) => /passive/i.test(ability.type)).length;
  const technicalDetails = abilities.flatMap((ability) => ability.technicalDetails ?? []);

  return {
    source: buildProfileSource,
    reason: [
      `${hero.name} was scored from Fandom overview text, listed strengths/weaknesses, ability descriptions, and ${technicalDetails.length} technical detail entries.`,
      `${hero.role} role weighting sets the baseline, then descriptions adjust Utility, Damage, Sustain, Mobility, and Ultimate independently.`,
      `${ultimateCount} ultimate-labeled ability entry${ultimateCount === 1 ? '' : 'ies'} and ${passiveCount} passive entry${passiveCount === 1 ? '' : 'ies'} influenced the final profile.`,
    ].join(' '),
    strongestSignals: [...buildTypes].sort((a, b) => profile[b] - profile[a]).slice(0, 2),
  };
}

function scoreAbility(scores, ability) {
  const text = abilityText(ability);
  const type = ability.type ?? '';
  const details = ability.technicalDetails ?? [];

  scoreText(scores, text, /normal attack/i.test(type) ? 0.42 : 0.55, 2);

  if (/normal attack/i.test(type)) {
    scores.Damage += 1.3;
  }

  if (/ultimate/i.test(type) || details.some((detail) => /energy cost/i.test(detail.label))) {
    scores.Ultimate += 2.4;
    scoreText(scores, text, 0.6, 2);

    if (/\b(heal|revive|resurrect|invincib|shield|barrier|damage reduction|protect)\b/i.test(text)) {
      scores.Ultimate += 2;
    }

    if (/\b(stun|slow|freeze|pull|knock|taunt|control|trap|prison)\b/i.test(text)) {
      scores.Ultimate += 1.2;
    }

    if (/\b(damage|burst|explode|blast|strike|slash|beam|meteor|storm)\b/i.test(text)) {
      scores.Ultimate += 1.2;
    }

    if (/\b(boost|amplify|enhance|grant|beacon|device|deploy)\b/i.test(text)) {
      scores.Ultimate += 1.5;
    }

    if (/\b(transform|empowered|unleash|summon|legend|goddess)\b/i.test(text)) {
      scores.Ultimate += 1.5;
    }
  }

  if (/team-up/i.test(type)) {
    scores.Utility += 0.8;
    scores.Ultimate += 0.4;
  }

  if (/passive/i.test(type)) {
    scores.Utility += 0.45;
  }

  for (const detail of details) {
    scoreTechnicalDetail(scores, detail);
  }
}

function scoreTechnicalDetail(scores, detail) {
  const label = `${detail.label ?? ''} ${detail.value ?? ''}`.toLowerCase();
  const numericValue = extractNumber(label);

  if (/damage|critical|vulnerability|bonus damage/.test(label)) {
    scores.Damage += numericValue >= 200 ? 0.6 : 0.35;
  }

  if (/heal|healing|health|bonus health|shield|damage reduction/.test(label)) {
    scores.Sustain += numericValue >= 200 ? 0.65 : 0.4;
  }

  if (/special effect|field/.test(label)) {
    scores.Utility += 0.2;
  } else if (/duration|range|radius|width|height/.test(label)) {
    scores.Utility += 0.05;
  }

  if (/speed|movement|dash|distance|flight/.test(label)) {
    scores.Mobility += 0.35;
  }

  if (/energy cost|ultimate/.test(label)) {
    scores.Ultimate += 0.55;
  }
}

function scoreText(scores, text, multiplier, maxMatchesPerRule) {
  for (const [type, rules] of Object.entries(signalRules)) {
    for (const [pattern, weight] of rules) {
      const matches = Math.min(text.match(pattern)?.length ?? 0, maxMatchesPerRule);
      scores[type] += matches * weight * multiplier;
    }
  }
}

function applyAbilityMixBonuses(scores, abilityTexts) {
  const allText = abilityTexts.join(' ').toLowerCase();

  if (/revive|resurrect|invincib|damage reduction|shield/.test(allText)) {
    scores.Utility += 1.1;
    scores.Sustain += 1.1;
  }

  if (/dash|leap|fly|flight|swing|teleport|speed/.test(allText) && /damage|strike|shot|slash|blast/.test(allText)) {
    scores.Mobility += 1;
    scores.Damage += 0.6;
  }

  if (/stun|freeze|slow|taunt|pull|knock|blind|root/.test(allText) && /damage|vulnerability|boost/.test(allText)) {
    scores.Utility += 1;
    scores.Damage += 0.7;
  }
}

function applyRoleWeights(scores, role) {
  const weights = roleWeights[role] ?? roleWeights.Duelist;

  for (const type of buildTypes) {
    scores[type] *= weights[type];
  }
}

function normalizeProfile(scores) {
  return Object.fromEntries(buildTypes.map((type) => [
    type,
    clamp(Math.round((scores[type] / normalizers[type]) * 10), 1, 10),
  ]));
}

function collectAbilities(hero) {
  const baseAbilities = hero.abilities ?? [];
  const kitAbilities = (hero.roleAbilityKits ?? []).flatMap((kit) => kit.abilities ?? []);
  const seen = new Set();
  const abilities = [];

  for (const ability of [...baseAbilities, ...kitAbilities]) {
    const key = `${ability.name}|${ability.type}|${ability.description}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    abilities.push(ability);
  }

  return abilities;
}

function abilityText(ability) {
  return [
    ability.name,
    ability.type,
    ability.description,
    ...(ability.technicalDetails ?? []).flatMap((detail) => [detail.label, detail.value]),
  ].join(' ');
}

function isUltimateAbility(ability) {
  return /ultimate/i.test(ability.type) ||
    (ability.technicalDetails ?? []).some((detail) => /energy cost/i.test(detail.label));
}

function extractNumber(value) {
  const match = value.match(/\d+(?:\.\d+)?/);

  return match ? Number(match[0]) : 0;
}

function emptyProfile() {
  return { Utility: 0, Damage: 0, Sustain: 0, Mobility: 0, Ultimate: 0 };
}

function addProfile(target, source) {
  for (const type of buildTypes) {
    target[type] += source[type] ?? 0;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
