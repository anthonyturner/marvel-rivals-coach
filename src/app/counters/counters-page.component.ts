import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CounterEngineService } from './counter-engine.service';
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
  private readonly counterEngine = inject(CounterEngineService);
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

    return this.counterEngine.filterHeroes(this.heroes(), role, searchTerm);
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

    return this.counterEngine.matchedCounterHeroes(selectedHero, this.heroes());
  });

  readonly unmatchedCounters = computed(() => {
    const selectedHero = this.selectedHero();

    if (!selectedHero) {
      return [];
    }

    return this.counterEngine.unmatchedCounters(selectedHero, this.heroes());
  });

  readonly heroesCounteredBySelected = computed(() => {
    const selectedHero = this.selectedHero();

    if (!selectedHero) {
      return [];
    }

    return this.counterEngine.heroesCounteredBy(selectedHero, this.heroes());
  });

  readonly topCounteredHeroes = computed(() =>
    this.counterEngine.topCounteredHeroes(this.heroes()),
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
    return this.counterEngine.counterSummary(hero, this.heroes());
  }

  counterReason(target: Hero, counterName: string): string {
    return this.counterEngine.counterReason(target, counterName, this.heroes());
  }
}
