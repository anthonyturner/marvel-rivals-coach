import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import type { TierListHero, TierListResponse } from '../../tier-list.model';
import type { SeasonHighlight, SeasonUpdate } from './home-season.model';
import { HeroUsageSectionComponent } from './sections/hero-usage-section/hero-usage-section.component';
import { HighlightCardsSectionComponent } from './sections/highlight-cards-section/highlight-cards-section.component';
import { SeasonUpdatesSectionComponent } from './sections/season-updates-section/season-updates-section.component';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    HeroUsageSectionComponent,
    HighlightCardsSectionComponent,
    SeasonUpdatesSectionComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements AfterViewInit {
  @ViewChild('heroBanner') private heroBanner?: ElementRef<HTMLElement>;

  backgroundVideoMuted = true;
  backgroundVideoForeground = false;
  backgroundVideoPoppedOut = false;
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly seasonUpdates: SeasonUpdate[] = [
    {
      category: 'Balance hotfix',
      date: 'July 11, 2026',
      title: 'The first Season 9 emergency balance pass is live',
      description:
        'Strategist healing-to-Ultimate conversion was raised to 70%, while Cyclops, Phoenix, Jubilee, and other heroes received immediate tuning.',
      sourceUrl: 'https://www.marvelrivals.com/balancepost/20260711/41667_1307328.html',
    },
    {
      category: 'Patch notes',
      date: 'July 10, 2026',
      title: 'Season 9 arrives with Jubilee and a rebuilt Team-Up system',
      description:
        'The launch update introduces Jubilee, The Mystery of Thebes story, a Black Widow rework, new events, rank rewards, and the Season 9 Battle Pass.',
      sourceUrl: 'https://www.marvelrivals.com/20260708/41525_1306959.html',
    },
    {
      category: 'Dev Vision Vol. 19',
      date: 'July 8, 2026',
      title: 'Inside The Mystery of Thebes',
      description:
        'The developers preview the new season, its combat-system overhaul, Jubilee, and the next chapter of the Marvel Rivals story.',
      sourceUrl: 'https://www.marvelrivals.com/20260708/41525_1306827.html',
    },
  ];

  readonly patchHighlights: SeasonHighlight[] = [
    {
      label: 'New hero',
      title: 'Jubilee',
      description:
        'The mutant firecracker joins the Duelist roster with explosive ranged pressure.',
    },
    {
      label: 'Combat system',
      title: 'Team-Ups rebuilt',
      description:
        'The Team-Up system received a ground-up redesign intended to reshape team composition.',
    },
    {
      label: 'Global change',
      title: 'Regenerative Shields',
      description:
        'Season 9 introduces a new health type alongside broad Ultimate-energy adjustments.',
    },
    {
      label: 'Hero rework',
      title: 'Black Widow',
      description: 'Natasha enters the season with significant ability and gameplay-loop changes.',
    },
  ];

  readonly seasonEvents: SeasonHighlight[] = [
    {
      label: 'Season event',
      title: 'Death of Apocalypse',
      description: 'Investigate the murders in Thebes and earn Units, Gallery Cards, and more.',
    },
    {
      label: 'Progression',
      title: 'Resurrection of the Horsemen',
      description: 'Complete seasonal missions for Units, Chrono Tokens, a Nameplate, and Sprays.',
    },
    {
      label: 'Rank reward',
      title: 'Jubilee — Crimson Crown',
      description: 'Reach Gold or above during Season 9 to unlock Jubilee’s ranked costume.',
    },
  ];

  readonly fallbackMostPickedHeroes: TierListHero[] = [
    {
      heroId: 1065,
      name: 'Jubilee',
      role: 'Damage',
      imageUrl: '/images/heroes/jubilee.png',
      tier: 'B',
      winRate: 46.41,
      pickRate: 61.23,
      banRate: 1.65,
      matches: 753991,
      wins: 349932,
      score: 44,
    },
    {
      heroId: 1025,
      name: 'Cloak & Dagger',
      role: 'Support',
      imageUrl: '/images/heroes/cloak-and-dagger.png',
      tier: 'B',
      winRate: 47.72,
      pickRate: 25.21,
      banRate: 4.04,
      matches: 310430,
      wins: 148146,
      score: 44,
    },
    {
      heroId: 1037,
      name: 'Magneto',
      role: 'Tank',
      imageUrl: '/images/heroes/magneto.png',
      tier: 'A',
      winRate: 50.98,
      pickRate: 24.87,
      banRate: 0.65,
      matches: 306239,
      wins: 156122,
      score: 47,
    },
    {
      heroId: 1023,
      name: 'Rocket Raccoon',
      role: 'Support',
      imageUrl: '/images/heroes/rocket-raccoon.png',
      tier: 'S',
      winRate: 56.19,
      pickRate: 19.5,
      banRate: 3.16,
      matches: 240189,
      wins: 134960,
      score: 52,
    },
    {
      heroId: 1060,
      name: 'White Fox',
      role: 'Support',
      imageUrl: '/images/heroes/white-fox.png',
      tier: 'B',
      winRate: 46.62,
      pickRate: 18.48,
      banRate: 1.12,
      matches: 227576,
      wins: 106082,
      score: 43,
    },
  ];

  mostPickedHeroes = this.fallbackMostPickedHeroes;
  metaUpdatedLabel = 'Season 9 current snapshot';

  constructor() {
    if (this.isBrowser) {
      this.loadSeasonMeta();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.updateBackgroundVideoPopout();
    }
  }

  @HostListener('window:scroll')
  updateBackgroundVideoPopout(): void {
    const hero = this.heroBanner?.nativeElement;

    if (!this.isBrowser || !hero || typeof hero.getBoundingClientRect !== 'function') {
      return;
    }

    this.backgroundVideoPoppedOut = hero.getBoundingClientRect().bottom <= 80;
  }

  startBackgroundVideo(video: HTMLVideoElement): void {
    video.muted = this.backgroundVideoMuted;
    video.defaultMuted = true;
    video.playsInline = true;

    void video.play().catch(() => {
      // The poster remains visible when a browser or user preference blocks autoplay.
    });
  }

  toggleBackgroundVideoSound(video: HTMLVideoElement): void {
    this.backgroundVideoMuted = !this.backgroundVideoMuted;
    video.muted = this.backgroundVideoMuted;

    if (!this.backgroundVideoMuted) {
      video.volume = 1;
    }

    void video.play().catch(() => {
      // The control remains available if playback needs another user gesture.
    });
  }

  onBackgroundVideoSurfaceClick(video: HTMLVideoElement): void {
    if (this.backgroundVideoForeground) {
      this.closeBackgroundVideo();
      return;
    }

    this.backgroundVideoForeground = true;
    void video.play().catch(() => {
      // Native foreground controls remain available if playback does not resume automatically.
    });
  }

  onBackgroundVideoKeydown(event: KeyboardEvent, video: HTMLVideoElement): void {
    if (this.backgroundVideoForeground || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    this.onBackgroundVideoSurfaceClick(video);
  }

  onForegroundVideoClick(event: MouseEvent): void {
    if (this.backgroundVideoForeground) {
      event.stopPropagation();
    }
  }

  syncBackgroundVideoSound(video: HTMLVideoElement): void {
    this.backgroundVideoMuted = video.muted;
  }

  closeBackgroundVideo(): void {
    this.backgroundVideoForeground = false;
  }

  @HostListener('document:keydown.escape')
  closeBackgroundVideoOnEscape(): void {
    if (this.backgroundVideoForeground) {
      this.closeBackgroundVideo();
    }
  }

  onHeroAvatarError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = '/images/heroes/default-hero.png';
  }

  private loadSeasonMeta(): void {
    this.http
      .get<TierListResponse | null>('/api/tier-list?rank=99&dataVersion=season-9')
      .pipe(catchError(() => of(null)))
      .subscribe((tierList) => {
        const selectedSeason = tierList?.seasons.find(
          (season) => season.id === tierList.selectedSeasonId,
        );

        if (!tierList || selectedSeason?.seasonNumber !== 9) {
          return;
        }

        this.mostPickedHeroes = tierList.tiers
          .flatMap((tier) => tier.heroes)
          .sort((first, second) => second.pickRate - first.pickRate)
          .slice(0, 5);
        this.metaUpdatedLabel = tierList.updatedAt
          ? `Updated ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(tierList.updatedAt))}`
          : 'Season 9 live snapshot';
      });
  }
}
