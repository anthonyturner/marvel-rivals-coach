import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HERO_GUIDES } from './hero-guide-data';

@Component({
  selector: 'app-hero-guides-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-guides-page.component.html',
  styleUrl: './hero-guides-page.component.css',
})
export class HeroGuidesPageComponent {
  readonly guides = HERO_GUIDES;
  readonly heroGuides = this.guides.filter((guide) => guide.category === 'hero');
  readonly fundamentalsGuides = this.guides.filter((guide) => guide.category === 'fundamentals');
}
