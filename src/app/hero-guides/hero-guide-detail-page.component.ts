import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { HERO_GUIDES } from './hero-guide-data';
import { HeroGuideSection } from './hero-guide-data';

@Component({
  selector: 'app-hero-guide-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-guide-detail-page.component.html',
  styleUrl: './hero-guide-detail-page.component.css',
})
export class HeroGuideDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  readonly guides = HERO_GUIDES;
  readonly selectedSection = signal<HeroGuideSection | undefined>(undefined);
  readonly selectedSectionIndex = signal(0);

  readonly guide = computed(() => {
    const heroId = this.route.snapshot.paramMap.get('heroId');

    return this.guides.find((guide) => guide.heroId === heroId) ?? this.guides[0];
  });

  readonly sourceEmbedUrl = computed(() => this.youtubeEmbedUrl(this.guide().sourceUrl));

  openSectionModal(section: HeroGuideSection, index: number): void {
    this.selectedSection.set(section);
    this.selectedSectionIndex.set(index);
  }

  closeSectionModal(): void {
    this.selectedSection.set(undefined);
  }

  @HostListener('document:keydown.escape')
  closeSectionModalOnEscape(): void {
    this.closeSectionModal();
  }

  private youtubeEmbedUrl(url?: string): SafeResourceUrl | undefined {
    if (!url) {
      return undefined;
    }

    const parsedUrl = new URL(url);
    const videoId = parsedUrl.searchParams.get('v') ?? '';

    if (!videoId) {
      return undefined;
    }

    const embedParams = new URLSearchParams();
    const start = parsedUrl.searchParams.get('t')?.replace(/\D/g, '');
    const playlist = parsedUrl.searchParams.get('list');

    if (start) {
      embedParams.set('start', start);
    }

    if (playlist) {
      embedParams.set('list', playlist);
    }

    const query = embedParams.toString();
    const embedUrl = `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ''}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
