import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {heroImagePath as heroImagePathFn} from "../utilities/string-utils";

import { HomeContentService } from './home-content.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  heroImagePath = heroImagePathFn;
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

}