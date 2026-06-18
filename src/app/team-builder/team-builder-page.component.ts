import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { computeHeroBuildProfile, heroBuildTypes, HeroBuildProfile, HeroBuildType } from '../heroes/hero-build-profile';
import { HeroDataService } from '../heroes/hero-data.service';
import { Hero, HeroRole } from '../heroes/hero.model';

type CompArchetype = 'Dive/Pick' | 'Poke' | 'Brawl' | 'Balanced';

interface BuildSignal {
  type: HeroBuildType;
  summary: string;
}

interface CompSummary {
  title: string;
  grade: string;
  description: string;
  roleLine: string;
  strengths: string[];
  risks: string[];
  buildScores: HeroBuildProfile;
}

@Component({
  selector: 'app-team-builder-page',
  imports: [CommonModule],
  templateUrl: './team-builder-page.component.html',
  styleUrl: './team-builder-page.component.css',
})
export class TeamBuilderPageComponent implements OnInit {
  private readonly heroDataService = inject(HeroDataService);
  private readonly diveHeroIds = new Set([
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
  private readonly pokeHeroIds = new Set([
    'black-widow',
    'hawkeye',
    'hela',
    'cyclops',
    'phoenix',
    'iron-man',
    'storm',
    'namor',
    'the-punisher',
  ]);
  private readonly brawlHeroIds = new Set([
    'groot',
    'the-thing',
    'hulk',
    'magneto',
    'emma-frost',
    'scarlet-witch',
    'squirrel-girl',
    'cloak-and-dagger',
  ]);

  private readonly heroes = signal<Hero[]>([]);
  readonly teamSlots = signal<(Hero | undefined)[]>(Array.from({ length: 6 }));
  readonly draggedHeroId = signal('');
  readonly selectedHeroId = signal('');

  readonly buildSignals: BuildSignal[] = [
    {
      type: 'Utility',
      summary: 'changes enemy choices with saves, control, denial, scouting, shields, and fight-shaping cooldowns',
    },
    {
      type: 'Damage',
      summary: 'wins through pressure, burst windows, target focus, and finishing power',
    },
    {
      type: 'Sustain',
      summary: 'survives longer with healing, shields, damage reduction, revives, and defensive resources',
    },
    {
      type: 'Mobility',
      summary: 'uses movement, rotations, vertical access, chase routes, and escapes to choose the fight location',
    },
    {
      type: 'Ultimate',
      summary: 'protects and converts a major ultimate or combo into the fight-winning moment',
    },
  ];
  readonly buildTypes = heroBuildTypes();

  readonly selectedHeroes = computed(() => this.teamSlots().filter((hero): hero is Hero => Boolean(hero)));

  readonly availableHeroes = computed(() => {
    const selectedIds = new Set(this.selectedHeroes().map((hero) => hero.id));

    return this.heroes().filter((hero) => !selectedIds.has(hero.id));
  });

  readonly selectedDraftHero = computed(() =>
    this.heroes().find((hero) => hero.id === this.selectedHeroId()),
  );

  readonly compSummary = computed<CompSummary>(() => {
    const selectedHeroes = this.selectedHeroes();
    const roleCounts = this.roleCounts(selectedHeroes);
    const buildScores = this.buildScores(selectedHeroes);
    const primaryBuild = this.primaryBuild(buildScores, selectedHeroes);
    const archetype = this.compArchetype(selectedHeroes, roleCounts);
    const filledSlots = selectedHeroes.length;
    const roleLine = `${roleCounts['Vanguard']} Vanguard / ${roleCounts['Duelist']} Duelist / ${roleCounts['Strategist']} Strategist`;

    if (filledSlots === 0) {
      return {
        title: 'Start building a six-player comp',
        grade: 'Empty',
        description:
          'Drag heroes into the six slots to analyze role balance and whether the team leans utility, damage, sustain, mobility, or ultimate focused.',
        roleLine,
        strengths: ['Use the hero thumbnails below as your draft pool.'],
        risks: ['The comp summary will activate after you add heroes.'],
        buildScores,
      };
    }

    const quality = this.compQuality(filledSlots, roleCounts, buildScores);
    const signal = this.buildSignals.find((item) => item.type === primaryBuild);

    return {
      title: `${primaryBuild} ${archetype} Comp`,
      grade: quality.grade,
      description:
        filledSlots < 6
          ? `You have ${filledSlots}/6 heroes selected. So far this looks like a ${primaryBuild.toLowerCase()}-leaning ${archetype.toLowerCase()} draft that ${signal?.summary ?? 'has a clear fight plan'}.`
          : this.compDescription(primaryBuild, archetype, signal?.summary),
      roleLine,
      strengths: this.compStrengths(primaryBuild, archetype, roleCounts, filledSlots),
      risks: this.compRisks(primaryBuild, archetype, roleCounts, filledSlots),
      buildScores,
    };
  });

  ngOnInit(): void {
    this.heroDataService.getHeroes().subscribe((heroes) => {
      this.heroes.set(heroes.map((hero) => ({
        ...hero,
        buildProfile: hero.buildProfile ?? computeHeroBuildProfile(hero),
      })));
    });
  }

  startHeroDrag(hero: Hero): void {
    this.draggedHeroId.set(hero.id);
    this.selectedHeroId.set(hero.id);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dropHero(slotIndex: number, event: DragEvent): void {
    event.preventDefault();
    const heroId = this.draggedHeroId();
    const hero = this.heroes().find((item) => item.id === heroId);

    if (!hero) {
      return;
    }

    this.placeHero(hero, slotIndex);
    this.draggedHeroId.set('');
    this.selectedHeroId.set('');
  }

  selectDraftHero(hero: Hero): void {
    this.selectedHeroId.set(hero.id);
  }

  placeSelectedHero(slotIndex: number): void {
    const selectedHero = this.selectedDraftHero();

    if (selectedHero) {
      this.placeHero(selectedHero, slotIndex);
      this.selectedHeroId.set('');
    }
  }

  removeHero(slotIndex: number): void {
    this.teamSlots.update((slots) => slots.map((slot, index) => index === slotIndex ? undefined : slot));
  }

  clearTeam(): void {
    this.teamSlots.set(Array.from({ length: 6 }));
    this.selectedHeroId.set('');
  }

  roleClass(role: HeroRole): string {
    return role.toLowerCase().replace(/\s+/g, '-');
  }

  heroBuildValue(hero: Hero, type: HeroBuildType): number {
    return (hero.buildProfile ?? computeHeroBuildProfile(hero))[type];
  }

  scoreTone(value: number, max = 10): string {
    const ratio = max > 0 ? value / max : 0;

    if (ratio >= 0.7) {
      return 'score-high';
    }

    if (ratio >= 0.4) {
      return 'score-mid';
    }

    return 'score-low';
  }

  private placeHero(hero: Hero, slotIndex: number): void {
    this.teamSlots.update((slots) => {
      const withoutDuplicate = slots.map((slot) => slot?.id === hero.id ? undefined : slot);

      return withoutDuplicate.map((slot, index) => index === slotIndex ? hero : slot);
    });
  }

  private roleCounts(heroes: Hero[]): Record<Exclude<HeroRole, 'Multi-Role'>, number> {
    return heroes.reduce(
      (counts, hero) => {
        const role = hero.role === 'Multi-Role' ? 'Duelist' : hero.role;
        counts[role] += 1;

        return counts;
      },
      { Vanguard: 0, Duelist: 0, Strategist: 0 },
    );
  }

  private buildScores(heroes: Hero[]): HeroBuildProfile {
    const scores: HeroBuildProfile = {
      Utility: 0,
      Damage: 0,
      Sustain: 0,
      Mobility: 0,
      Ultimate: 0,
    };

    for (const hero of heroes) {
      const profile = hero.buildProfile ?? computeHeroBuildProfile(hero);
      scores.Utility += profile.Utility;
      scores.Damage += profile.Damage;
      scores.Sustain += profile.Sustain;
      scores.Mobility += profile.Mobility;
      scores.Ultimate += profile.Ultimate;
    }

    return scores;
  }

  private primaryBuild(scores: HeroBuildProfile, heroes: Hero[]): HeroBuildType {
    const diveCount = heroes.filter((hero) => this.diveHeroIds.has(hero.id)).length;

    if (diveCount >= 2 && scores.Mobility >= scores.Damage - 8) {
      return 'Mobility';
    }

    return this.buildTypes
      .sort((a, b) => scores[b] - scores[a])[0];
  }

  private compArchetype(
    heroes: Hero[],
    roleCounts: Record<Exclude<HeroRole, 'Multi-Role'>, number>,
  ): CompArchetype {
    const diveCount = heroes.filter((hero) => this.diveHeroIds.has(hero.id)).length;
    const pokeCount = heroes.filter((hero) => this.pokeHeroIds.has(hero.id)).length;
    const brawlCount = heroes.filter((hero) => this.brawlHeroIds.has(hero.id)).length;

    if (diveCount >= 2) {
      return 'Dive/Pick';
    }

    if (pokeCount >= 2 && diveCount === 0) {
      return 'Poke';
    }

    if (brawlCount >= 2 || roleCounts.Vanguard >= 2) {
      return 'Brawl';
    }

    return 'Balanced';
  }

  private compDescription(
    primaryBuild: HeroBuildType,
    archetype: CompArchetype,
    buildSummary = 'has a defined fight plan',
  ): string {
    if (archetype === 'Dive/Pick') {
      return `This six-player team reads more like a dive/pick comp than a raw damage comp. Based on the build theory page, its ${primaryBuild.toLowerCase()} lean means it wants to stage first, collapse on a vulnerable target, force defensive cooldowns, then reset before the counter-engage.`;
    }

    return `This six-player team looks like a ${primaryBuild.toLowerCase()}-leaning ${archetype.toLowerCase()} comp. Based on the build theory page, it ${buildSummary}.`;
  }

  private compQuality(
    filledSlots: number,
    roleCounts: Record<Exclude<HeroRole, 'Multi-Role'>, number>,
    scores: HeroBuildProfile,
  ): { grade: string; score: number } {
    let score = 0;

    score += filledSlots * 8;
    score += roleCounts.Vanguard >= 1 ? 14 : -12;
    score += roleCounts.Strategist >= 2 ? 18 : roleCounts.Strategist === 1 ? 6 : -16;
    score += roleCounts.Duelist >= 2 ? 10 : 0;
    score += roleCounts.Duelist > 3 ? -8 : 0;
    score += Math.max(...Object.values(scores)) >= 8 ? 10 : 0;

    if (filledSlots < 6) {
      score -= (6 - filledSlots) * 7;
    }

    if (score >= 82) {
      return { grade: 'Excellent', score };
    }

    if (score >= 66) {
      return { grade: 'Strong', score };
    }

    if (score >= 48) {
      return { grade: 'Playable', score };
    }

    return { grade: 'Needs work', score };
  }

  private compStrengths(
    primaryBuild: HeroBuildType,
    archetype: CompArchetype,
    roleCounts: Record<Exclude<HeroRole, 'Multi-Role'>, number>,
    filledSlots: number,
  ): string[] {
    const strengths: string[] = [];

    if (filledSlots === 6) {
      strengths.push('Full six-player draft is ready to evaluate.');
    }

    if (roleCounts.Vanguard >= 1) {
      strengths.push('Has a frontline anchor for space taking and safer engages.');
    }

    if (roleCounts.Strategist >= 2) {
      strengths.push('Has enough support structure to stabilize longer fights.');
    }

    if (roleCounts.Duelist >= 2) {
      strengths.push('Has enough damage threat to convert pressure into eliminations.');
    }

    if (archetype === 'Dive/Pick') {
      strengths.push('Has setup-and-collapse threat: mobile heroes can stage, split attention, and punish isolated targets.');
    }

    strengths.push(this.primaryBuildStrength(primaryBuild));

    return strengths;
  }

  private compRisks(
    primaryBuild: HeroBuildType,
    archetype: CompArchetype,
    roleCounts: Record<Exclude<HeroRole, 'Multi-Role'>, number>,
    filledSlots: number,
  ): string[] {
    const risks: string[] = [];

    if (filledSlots < 6) {
      risks.push('Add all six heroes before trusting the final comp grade.');
    }

    if (roleCounts.Vanguard === 0) {
      risks.push('No Vanguard means the team may struggle to start fights or cross dangerous space.');
    }

    if (roleCounts.Strategist < 2) {
      risks.push('Less than two Strategists can make resets, sustain, and long fights difficult.');
    }

    if (roleCounts.Duelist > 3) {
      risks.push('Too many Duelists can create pressure but may leave the team short on stability.');
    }

    if (archetype === 'Dive/Pick') {
      risks.push('Dive/pick comps are timing-sensitive. If Black Panther, Magik, or other divers enter before attention is split, the comp can look low-damage and stall out.');
    }

    if (primaryBuild === 'Ultimate') {
      risks.push('Ultimate comps need patience. Spending key cooldowns early can ruin the fight-winning timing.');
    }

    if (primaryBuild === 'Damage') {
      risks.push('Damage-heavy comps must avoid farming stats into tanks instead of forcing useful angles.');
    }

    return risks.length > 0 ? risks : ['No major structural risk detected. The main challenge is execution and cooldown timing.'];
  }

  private primaryBuildStrength(type: HeroBuildType): string {
    switch (type) {
      case 'Utility':
        return 'Utility tools can answer enemy win conditions and create cleaner engages.';
      case 'Damage':
        return 'Damage pressure can force mistakes quickly when angles and target focus are disciplined.';
      case 'Sustain':
        return 'Sustain lets the team absorb pressure and win longer resource trades.';
      case 'Mobility':
        return 'Mobility gives the team better rotations, chase routes, exits, and target swaps.';
      case 'Ultimate':
        return 'Ultimate focus gives the team a clear fight-winning conversion plan.';
    }
  }
}
