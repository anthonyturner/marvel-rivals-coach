import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
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
export class HomePageComponent implements AfterViewInit {
  @ViewChild('heroBanner') private heroBanner?: ElementRef<HTMLElement>;

  heroImagePath = heroImagePathFn;
  backgroundVideoMuted = true;
  backgroundVideoForeground = false;
  backgroundVideoPoppedOut = false;
  private readonly homeContentService = inject(HomeContentService);

  readonly content = toSignal(this.homeContentService.getHomeContent(), {
    initialValue: this.homeContentService.fallbackContent,
  });

  ngAfterViewInit(): void {
    this.updateBackgroundVideoPopout();
  }

  @HostListener('window:scroll')
  updateBackgroundVideoPopout(): void {
    const hero = this.heroBanner?.nativeElement;

    if (!hero) {
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
