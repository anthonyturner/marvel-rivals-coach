import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { HomeContentService } from './home-content.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  private readonly homeContentService = inject(HomeContentService);

  readonly content = toSignal(this.homeContentService.getHomeContent(), {
    initialValue: this.homeContentService.fallbackContent,
  });

  onNewsImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = '/images/heroes/doctor-strange.png';
  }

  onHeroAvatarError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = '/images/heroes/default-hero.png';
  }

  isReportedHero(label: string): boolean {
    const normalizedLabel = label.toLowerCase();

    return normalizedLabel.includes('reported hero') || normalizedLabel.includes('latest hero');
  }

  heroImagePath(heroName: string): string {
    const slug = heroName
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/['.]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `/images/heroes/${slug || 'default-hero'}.png`;
  }
}
