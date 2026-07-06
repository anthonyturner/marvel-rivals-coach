import { Injectable } from '@angular/core';

import { Hero, HeroRole } from '../heroes/hero.model';

type RoleFilter = HeroRole | 'All';
type ThreatProfile = 'backline' | 'dive' | 'flyer' | 'sniper' | 'summon' | 'tank' | 'general';
type AnswerProfile =
  | 'anti-dive'
  | 'control'
  | 'dive'
  | 'hitscan'
  | 'range'
  | 'sustain'
  | 'tank-breaker'
  | 'general';

const threatProfiles: Record<Exclude<ThreatProfile, 'general' | 'tank'>, string[]> = {
  backline: [
    'Adam Warlock',
    'Cloak & Dagger',
    'Gambit',
    'Invisible Woman',
    'Jeff the Land Shark',
    'Loki',
    'Luna Snow',
    'Mantis',
    'Rocket Raccoon',
    'Ultron',
    'White Fox',
  ],
  dive: [
    'Black Cat',
    'Black Panther',
    'Daredevil',
    'Iron Fist',
    'Magik',
    'Psylocke',
    'Spider-Man',
    'Venom',
    'Wolverine',
  ],
  flyer: ['Angela', 'Human Torch', 'Iron Man', 'Star-Lord', 'Storm'],
  sniper: ['Black Widow', 'Hawkeye', 'Hela', 'The Punisher'],
  summon: ['Groot', 'Namor', 'Peni Parker'],
};

const answerProfiles: Record<Exclude<AnswerProfile, 'general'>, string[]> = {
  'anti-dive': ['Namor', 'Peni Parker', 'Scarlet Witch', 'The Thing'],
  hitscan: ['Black Widow', 'Hawkeye', 'Hela', 'The Punisher'],
  dive: ['Black Cat', 'Black Panther', 'Magik', 'Psylocke', 'Spider-Man', 'Venom'],
  sustain: ['Luna Snow', 'Mantis', 'Invisible Woman', 'Rocket Raccoon', 'Cloak & Dagger'],
  'tank-breaker': ['Wolverine', 'The Punisher', 'Hela'],
  range: ['Doctor Strange', 'Magneto', 'Moon Knight', 'Human Torch'],
  control: ['Doctor Strange', 'Mantis', 'Scarlet Witch', 'Peni Parker'],
};

const specificCounterReasons: Record<string, string> = {
  'Black Panther|Namor':
    'Namor is one of the cleanest anti-dive answers: turret pressure keeps hitting Black Panther through his dash-in rhythm and makes resets much harder.',
  'Black Panther|Scarlet Witch':
    'Scarlet Witch can keep easy tracking damage on Black Panther while he moves through melee range, forcing him to disengage sooner.',
  'Black Panther|Peni Parker':
    'Peni Parker makes the dive path expensive with traps, web zones, and setup control that Black Panther has to cross before reaching the backline.',
  'Spider-Man|Namor':
    'Namor turret pressure tracks Spider-Man during web entries and punishes him before he can finish the backline combo.',
  'Iron Man|Namor':
    'Namor can place pressure that keeps Iron Man from hovering freely, especially when turret angles cover his escape routes.',
  'Venom|Wolverine':
    'Wolverine is built to punish high-health frontliners, so Venom cannot rely on bonus health and extended brawls as freely.',
  'Hulk|Wolverine':
    'Wolverine threatens Hulk in extended close-range fights and cuts through the value Hulk wants from staying in the frontline.',
};

@Injectable({ providedIn: 'root' })
export class CounterEngineService {
  filterHeroes(heroes: Hero[], role: RoleFilter, searchTerm: string): Hero[] {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return heroes.filter((hero) => {
      const matchesRole = role === 'All' || hero.role === role || this.heroHasRoleKit(hero, role);
      const matchesSearch =
        !normalizedSearchTerm ||
        hero.name.toLowerCase().includes(normalizedSearchTerm) ||
        hero.counters.some((counter) => counter.toLowerCase().includes(normalizedSearchTerm));

      return matchesRole && matchesSearch;
    });
  }

  matchedCounterHeroes(target: Hero, heroes: Hero[]): Hero[] {
    return target.counters
      .map((counter) => this.findHeroByName(counter, heroes))
      .filter((hero): hero is Hero => Boolean(hero));
  }

  unmatchedCounters(target: Hero, heroes: Hero[]): string[] {
    return target.counters.filter((counter) => !this.findHeroByName(counter, heroes));
  }

  heroesCounteredBy(counterHero: Hero, heroes: Hero[]): Hero[] {
    const counterName = this.normalizeName(counterHero.name);

    return heroes.filter(
      (hero) =>
        hero.id !== counterHero.id &&
        hero.counters.some((counter) => this.normalizeName(counter) === counterName),
    );
  }

  topCounteredHeroes(heroes: Hero[], limit = 6): Hero[] {
    return [...heroes]
      .sort((a, b) => b.counters.length - a.counters.length || a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  counterSummary(hero: Hero, heroes: Hero[]): string {
    const matched = hero.counters.filter((counter) => this.findHeroByName(counter, heroes)).length;
    const concepts = Math.max(hero.counters.length - matched, 0);
    const parts = [
      matched ? `${matched} hero picks` : '',
      concepts ? `${concepts} matchup notes` : '',
    ].filter(Boolean);

    return parts.join(' + ') || 'Counter data pending';
  }

  counterReason(target: Hero, counterName: string, heroes: Hero[]): string {
    const counter = this.findHeroByName(counterName, heroes);

    if (!counter) {
      return `${counterName} is a matchup answer because it attacks a key part of ${target.name}'s fight plan.`;
    }

    const targetProfile = this.heroThreatProfile(target);
    const counterProfile = this.heroAnswerProfile(counter);
    const specificReason = specificCounterReasons[`${target.name}|${counter.name}`];

    if (specificReason) {
      return specificReason;
    }

    if (targetProfile === 'dive' && counterProfile === 'anti-dive') {
      return `${counter.name} punishes ${target.name}'s dive timing with area denial, tracking pressure, or peel before the engage can reset.`;
    }

    if (targetProfile === 'flyer' && counterProfile === 'hitscan') {
      return `${counter.name} can keep consistent sightline pressure on ${target.name}, forcing them lower, slower, or back to cover.`;
    }

    if (targetProfile === 'tank' && counterProfile === 'tank-breaker') {
      return `${counter.name} pressures ${target.name}'s health pool and makes extended frontline trades harder to survive.`;
    }

    if (targetProfile === 'backline' && counterProfile === 'dive') {
      return `${counter.name} can reach ${target.name}'s position quickly, force defensive cooldowns, and break their safe support rhythm.`;
    }

    if (targetProfile === 'sniper' && counterProfile === 'dive') {
      return `${counter.name} closes distance quickly, denies comfortable sightlines, and turns ${target.name}'s range advantage into a scramble.`;
    }

    if (targetProfile === 'summon' && counterProfile === 'range') {
      return `${counter.name} can clear or pressure ${target.name}'s setup from safer angles before the zone takes over the fight.`;
    }

    if (counterProfile === 'control') {
      return `${counter.name} interrupts ${target.name}'s preferred timing with crowd control, zoning, or forced repositioning.`;
    }

    if (counterProfile === 'sustain') {
      return `${counter.name} helps the team live through ${target.name}'s burst window, denying the quick pick they need.`;
    }

    return `${counter.name} counters ${target.name} by challenging their preferred range, timing, or cooldown cycle.`;
  }

  private findHeroByName(name: string, heroes: Hero[]): Hero | undefined {
    const normalized = this.normalizeName(name);

    return heroes.find((hero) => this.normalizeName(hero.name) === normalized);
  }

  private normalizeName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  private heroHasRoleKit(hero: Hero, role: RoleFilter): boolean {
    return role !== 'All' && Boolean(hero.roleAbilityKits?.some((kit) => kit.role === role));
  }

  private heroThreatProfile(hero: Hero): ThreatProfile {
    for (const [profile, heroNames] of Object.entries(threatProfiles)) {
      if (heroNames.includes(hero.name)) {
        return profile as ThreatProfile;
      }
    }

    if (hero.role === 'Vanguard') {
      return 'tank';
    }

    return 'general';
  }

  private heroAnswerProfile(hero: Hero): AnswerProfile {
    for (const [profile, heroNames] of Object.entries(answerProfiles)) {
      if (heroNames.includes(hero.name)) {
        return profile as AnswerProfile;
      }
    }

    return 'general';
  }
}
