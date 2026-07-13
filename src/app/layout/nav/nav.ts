import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAVIGATION_CATEGORIES } from '../../navigation-category/navigation-category.data';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  readonly isMenuOpen = signal(false);
  readonly openGroup = signal<string | null>(null);

  readonly primaryNavItems = [
    { label: 'Home', path: '/', enabled: true },
    { label: 'Heroes', path: '/heroes', enabled: true },
  ];

  readonly navGroups = NAVIGATION_CATEGORIES;

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
    if (!this.isMenuOpen()) {
      this.openGroup.set(null);
    }
  }

  toggleGroup(label: string): void {
    this.openGroup.update((openGroup) => openGroup === label ? null : label);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.openGroup.set(null);
  }

}
