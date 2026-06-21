import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { HeroDataService } from '../heroes/hero-data.service';
import { Hero, HeroRole } from '../heroes/hero.model';

type RoleFilter = HeroRole | 'All';

@Component({
  selector: 'app-counters-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './counters-page.component.html',
  styleUrl: './counters-page.component.css',
})
export class CountersPageComponent implements OnInit {
  private readonly heroDataService = inject(HeroDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly heroes = signal<Hero[]>([]);

  readonly roles: RoleFilter[] = ['All', 'Vanguard', 'Duelist', 'Strategist', 'Multi-Role'];
  readonly selectedRole = signal<RoleFilter>('All');
  readonly selectedHeroId = signal('');
  readonly searchTerm = signal('');
  readonly heroCount = computed(() => this.heroes().length);

  readonly filteredHeroes = computed(() => {
    const role = this.selectedRole();
    const searchTerm = this.searchTerm().trim().toLowerCase();

    return this.heroes().filter((hero) => {
      const matchesRole = role === 'All' || hero.role === role || this.heroHasRoleKit(hero, role);
      const matchesSearch =
        !searchTerm ||
        hero.name.toLowerCase().includes(searchTerm) ||
        hero.counters.some((counter) => counter.toLowerCase().includes(searchTerm));

      return matchesRole && matchesSearch;
    });
  });

  readonly selectedHero = computed(() => {
    const selected = this.heroes().find((hero) => hero.id === this.selectedHeroId());

    return selected ?? this.filteredHeroes()[0] ?? this.heroes()[0];
  });

  readonly matchedCounterHeroes = computed(() => {
    const selectedHero = this.selectedHero();

    if (!selectedHero) {
      return [];
    }

    return selectedHero.counters
      .map((counter) => this.findHeroByName(counter))
      .filter((hero): hero is Hero => Boolean(hero));
  });

  readonly unmatchedCounters = computed(() => {
    const selectedHero = this.selectedHero();

    if (!selectedHero) {
      return [];
    }

    return selectedHero.counters.filter((counter) => !this.findHeroByName(counter));
  });

  readonly heroesCounteredBySelected = computed(() => {
    const selectedHero = this.selectedHero();

    if (!selectedHero) {
      return [];
    }

    const selectedName = this.normalizeName(selectedHero.name);

    return this.heroes().filter((hero) =>
      hero.id !== selectedHero.id &&
      hero.counters.some((counter) => this.normalizeName(counter) === selectedName),
    );
  });

  readonly topCounteredHeroes = computed(() =>
    [...this.heroes()]
      .sort((a, b) => b.counters.length - a.counters.length || a.name.localeCompare(b.name))
      .slice(0, 6),
  );

  ngOnInit(): void {
    this.heroDataService.getHeroes().subscribe((heroes) => {
      const requestedHeroId = this.route.snapshot.queryParamMap.get('hero') ?? '';
      const initialHero = heroes.find((hero) => hero.id === requestedHeroId) ?? heroes[0];

      this.heroes.set(heroes);
      this.selectedHeroId.set(initialHero?.id ?? '');
    });
  }

  selectRole(role: RoleFilter): void {
    this.selectedRole.set(role);
    this.selectedHeroId.set(this.filteredHeroes()[0]?.id ?? '');
  }

  selectHero(heroId: string): void {
    this.selectedHeroId.set(heroId);
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
    this.selectedHeroId.set(this.filteredHeroes()[0]?.id ?? '');
  }

  roleClass(role: HeroRole): string {
    return role.toLowerCase().replace(/\s+/g, '-');
  }

  counterCountLabel(hero: Hero): string {
    return `${hero.counters.length} counter${hero.counters.length === 1 ? '' : 's'}`;
  }

  counterSummary(hero: Hero): string {
    const matched = hero.counters.filter((counter) => this.findHeroByName(counter)).length;
    const concepts = Math.max(hero.counters.length - matched, 0);
    const parts = [
      matched ? `${matched} hero picks` : '',
      concepts ? `${concepts} matchup notes` : '',
    ].filter(Boolean);

    return parts.join(' + ') || 'Counter data pending';
  }

  counterReason(target: Hero, counterName: string): string {
    const counter = this.findHeroByName(counterName);

    if (!counter) {
      return `${counterName} is a matchup answer because it attacks a key part of ${target.name}'s fight plan.`;
    }

    const targetProfile = this.heroThreatProfile(target);
    const counterProfile = this.heroAnswerProfile(counter);
    const specificReason = this.specificCounterReason(target.name, counter.name);

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

  private findHeroByName(name: string): Hero | undefined {
    const normalized = this.normalizeName(name);

    return this.heroes().find((hero) => this.normalizeName(hero.name) === normalized);
  }

  private normalizeName(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  private heroHasRoleKit(hero: Hero, role: RoleFilter): boolean {
    return role !== 'All' && Boolean(hero.roleAbilityKits?.some((kit) => kit.role === role));
  }

  private heroThreatProfile(hero: Hero): 'backline' | 'dive' | 'flyer' | 'sniper' | 'summon' | 'tank' | 'general' {
    if (['Adam Warlock', 'Cloak & Dagger', 'Gambit', 'Invisible Woman', 'Jeff the Land Shark', 'Loki', 'Luna Snow', 'Mantis', 'Rocket Raccoon', 'Ultron', 'White Fox'].includes(hero.name)) {
      return 'backline';
    }

    if (['Black Cat', 'Black Panther', 'Daredevil', 'Iron Fist', 'Magik', 'Psylocke', 'Spider-Man', 'Venom', 'Wolverine'].includes(hero.name)) {
      return 'dive';
    }

    if (['Angela', 'Human Torch', 'Iron Man', 'Star-Lord', 'Storm'].includes(hero.name)) {
      return 'flyer';
    }

    if (['Black Widow', 'Hawkeye', 'Hela', 'The Punisher'].includes(hero.name)) {
      return 'sniper';
    }

    if (['Groot', 'Namor', 'Peni Parker'].includes(hero.name)) {
      return 'summon';
    }

    if (hero.role === 'Vanguard') {
      return 'tank';
    }

    return 'general';
  }

  private heroAnswerProfile(hero: Hero): 'anti-dive' | 'control' | 'dive' | 'hitscan' | 'range' | 'sustain' | 'tank-breaker' | 'general' {
    if (['Namor', 'Peni Parker', 'Scarlet Witch', 'The Thing'].includes(hero.name)) {
      return 'anti-dive';
    }

    if (['Black Widow', 'Hawkeye', 'Hela', 'The Punisher'].includes(hero.name)) {
      return 'hitscan';
    }

    if (['Black Cat', 'Black Panther', 'Magik', 'Psylocke', 'Spider-Man', 'Venom'].includes(hero.name)) {
      return 'dive';
    }

    if (['Luna Snow', 'Mantis', 'Invisible Woman', 'Rocket Raccoon', 'Cloak & Dagger'].includes(hero.name)) {
      return 'sustain';
    }

    if (['Wolverine', 'The Punisher', 'Hela'].includes(hero.name)) {
      return 'tank-breaker';
    }

    if (['Doctor Strange', 'Magneto', 'Moon Knight', 'Human Torch'].includes(hero.name)) {
      return 'range';
    }

    if (['Doctor Strange', 'Mantis', 'Scarlet Witch', 'Peni Parker'].includes(hero.name)) {
      return 'control';
    }

    return 'general';
  }

  private specificCounterReason(targetName: string, counterName: string): string {
    const matchupKey = `${targetName}|${counterName}`;
    const reasons: Record<string, string> = {
      'Black Panther|Namor': 'Namor is one of the cleanest anti-dive answers: turret pressure keeps hitting Black Panther through his dash-in rhythm and makes resets much harder.',
      'Black Panther|Scarlet Witch': 'Scarlet Witch can keep easy tracking damage on Black Panther while he moves through melee range, forcing him to disengage sooner.',
      'Black Panther|Peni Parker': 'Peni Parker makes the dive path expensive with traps, web zones, and setup control that Black Panther has to cross before reaching the backline.',
      'Spider-Man|Namor': 'Namor turret pressure tracks Spider-Man during web entries and punishes him before he can finish the backline combo.',
      'Iron Man|Namor': 'Namor can place pressure that keeps Iron Man from hovering freely, especially when turret angles cover his escape routes.',
      'Venom|Wolverine': 'Wolverine is built to punish high-health frontliners, so Venom cannot rely on bonus health and extended brawls as freely.',
      'Hulk|Wolverine': 'Wolverine threatens Hulk in extended close-range fights and cuts through the value Hulk wants from staying in the frontline.',
    };

    return reasons[matchupKey] ?? '';
  }
}
