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
  backgroundVideoMuted = true;
  private readonly homeContentService = inject(HomeContentService);

  readonly content = toSignal(this.homeContentService.getHomeContent(), {
    initialValue: this.homeContentService.fallbackContent,
  });

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
