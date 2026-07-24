import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import {
  type Season9CoreRole,
  type Season9ReportPayload,
  type Season9Trend,
} from './season-9-win-rates.data';
import { Season9WinRatesService } from './season-9-win-rates.service';

type RoleFilter = Season9CoreRole | 'All';
type TrendFilter = Season9Trend | 'All';

@Component({
  selector: 'app-season-9-win-rates-page',
  imports: [RouterLink],
  templateUrl: './season-9-win-rates-page.component.html',
  styleUrl: './season-9-win-rates-page.component.css',
})
export class Season9WinRatesPageComponent {
  private readonly reportService = inject(Season9WinRatesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly videoUrl = 'https://www.youtube.com/watch?v=VB6OIA-ChmA';
  readonly report = signal<Season9ReportPayload | null>(null);
  readonly metaQuadrants = computed(() => this.report()?.metaQuadrants ?? []);
  readonly roleLadder = computed(() => this.report()?.roleLadder ?? []);
  readonly oneTricks = computed(() => this.report()?.oneTricks ?? []);
  readonly roleFilters: readonly RoleFilter[] = ['All', 'Vanguard', 'Strategist', 'Duelist'];
  readonly trendFilters: readonly TrendFilter[] = [
    'All',
    'Climbing',
    'Stable',
    'Falling',
    'Volatile',
  ];

  readonly selectedRole = signal<RoleFilter>('All');
  readonly selectedTrend = signal<TrendFilter>('All');
  readonly searchTerm = signal('');

  readonly filteredInsights = computed(() => {
    const role = this.selectedRole();
    const trend = this.selectedTrend();
    const query = this.searchTerm().trim().toLowerCase();

    return (this.report()?.heroInsights ?? []).filter((insight) => {
      const matchesRole = role === 'All' || insight.role === role;
      const matchesTrend = trend === 'All' || insight.trend === trend;
      const matchesQuery =
        !query ||
        insight.displayName.toLowerCase().includes(query) ||
        insight.archetype.toLowerCase().includes(query) ||
        insight.takeaway.toLowerCase().includes(query);

      return matchesRole && matchesTrend && matchesQuery;
    });
  });

  constructor() {
    if (this.isBrowser) {
      this.reportService
        .getReport()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((report) => this.report.set(report));
    }
  }

  selectRole(role: RoleFilter): void {
    this.selectedRole.set(role);
  }

  selectTrend(trend: TrendFilter): void {
    this.selectedTrend.set(trend);
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = '/images/heroes/default-hero.png';
  }
}
