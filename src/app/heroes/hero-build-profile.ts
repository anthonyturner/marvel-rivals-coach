import { Hero } from './hero.model';

export type HeroBuildType = 'Utility' | 'Damage' | 'Sustain' | 'Mobility' | 'Ultimate';

export type HeroBuildProfile = Record<HeroBuildType, number>;

interface BuildSignal {
  type: HeroBuildType;
  terms: RegExp;
}

const buildSignals: BuildSignal[] = [
  {
    type: 'Utility',
    terms: /shield|barrier|wall|revive|resurrect|stun|slow|knock|control|taunt|blind|scan|reveal|boost|deny|disrupt|pull|root|save|cleanse|invincible|line of sight/i,
  },
  {
    type: 'Damage',
    terms: /damage|burst|pressure|pick|final|critical|headshot|vulnerability|explode|blast|duel|finish|kill|poke/i,
  },
  {
    type: 'Sustain',
    terms: /heal|healing|health|armor|overhealth|bonus health|damage reduction|restore|sustain|revive|shield|barrier|survive/i,
  },
  {
    type: 'Mobility',
    terms: /dash|leap|jump|flight|fly|swing|teleport|blink|movement|speed|rotate|reposition|high ground|off-angle|off angle|escape|chase/i,
  },
  {
    type: 'Ultimate',
    terms: /ultimate|energy cost|ult|combo|teamfight swing|fight-winning|empowered|transform/i,
  },
];

const diveHeroIds = new Set([
  'black-panther',
  'magik',
  'spider-man',
  'psylocke',
  'iron-fist',
  'daredevil',
  'black-cat',
  'venom',
  'captain-america',
  'thor',
  'wolverine',
]);

const setupPickHeroIds = new Set([
  'black-widow',
  'hawkeye',
  'hela',
  'winter-soldier',
  'star-lord',
]);

const curatedProfileFloors: Record<string, Partial<HeroBuildProfile>> = {
  'invisible-woman': {
    Utility: 10,
    Sustain: 8,
    Ultimate: 10,
  },
  'luna-snow': {
    Utility: 8,
    Sustain: 10,
    Mobility: 7,
    Ultimate: 9,
  },
  'rocket-raccoon': {
    Utility: 9,
    Sustain: 8,
    Mobility: 7,
    Ultimate: 8,
  },
  hulk: {
    Sustain: 9,
    Mobility: 8,
    Utility: 7,
  },
  hela: {
    Damage: 9,
    Mobility: 5,
    Ultimate: 8,
  },
};

export function heroBuildTypes(): HeroBuildType[] {
  return buildSignals.map((signal) => signal.type);
}

export function computeHeroBuildProfile(hero: Hero): HeroBuildProfile {
  const profile: HeroBuildProfile = {
    Utility: 0,
    Damage: 0,
    Sustain: 0,
    Mobility: 0,
    Ultimate: 0,
  };

  const searchableText = [
    hero.summary,
    hero.playstyle,
    ...hero.strengths,
    ...hero.weaknesses,
    ...hero.abilities.flatMap((ability) => [
      ability.name,
      ability.type,
      ability.description,
      ...(ability.technicalDetails ?? []).flatMap((detail) => [detail.label, detail.value]),
    ]),
    ...(hero.roleAbilityKits ?? []).flatMap((kit) =>
      kit.abilities.flatMap((ability) => [
        ability.name,
        ability.type,
        ability.description,
        ...(ability.technicalDetails ?? []).flatMap((detail) => [detail.label, detail.value]),
      ]),
    ),
  ].join(' ');

  for (const signal of buildSignals) {
    const matches = searchableText.match(new RegExp(signal.terms.source, 'gi'))?.length ?? 0;
    profile[signal.type] += Math.min(matches, 4);
  }

  if (hero.role === 'Strategist') {
    profile.Sustain += 3;
    profile.Utility += 2;
  }

  if (hero.role === 'Vanguard') {
    profile.Sustain += 2;
    profile.Utility += 2;
  }

  if (hero.role === 'Duelist') {
    profile.Damage += 2;
    profile.Mobility += 1;
  }

  if (diveHeroIds.has(hero.id)) {
    profile.Mobility += 5;
    profile.Utility += 1;
  }

  if (setupPickHeroIds.has(hero.id)) {
    profile.Damage += 1;
    profile.Utility += 2;
  }

  return applyCuratedFloors(hero.id, clampProfile(profile));
}

export function emptyHeroBuildProfile(): HeroBuildProfile {
  return {
    Utility: 0,
    Damage: 0,
    Sustain: 0,
    Mobility: 0,
    Ultimate: 0,
  };
}

function clampProfile(profile: HeroBuildProfile): HeroBuildProfile {
  return {
    Utility: Math.min(10, Math.round(profile.Utility)),
    Damage: Math.min(10, Math.round(profile.Damage)),
    Sustain: Math.min(10, Math.round(profile.Sustain)),
    Mobility: Math.min(10, Math.round(profile.Mobility)),
    Ultimate: Math.min(10, Math.round(profile.Ultimate)),
  };
}

function applyCuratedFloors(heroId: string, profile: HeroBuildProfile): HeroBuildProfile {
  const floors = curatedProfileFloors[heroId];

  if (!floors) {
    return profile;
  }

  return {
    Utility: Math.max(profile.Utility, floors.Utility ?? 0),
    Damage: Math.max(profile.Damage, floors.Damage ?? 0),
    Sustain: Math.max(profile.Sustain, floors.Sustain ?? 0),
    Mobility: Math.max(profile.Mobility, floors.Mobility ?? 0),
    Ultimate: Math.max(profile.Ultimate, floors.Ultimate ?? 0),
  };
}
