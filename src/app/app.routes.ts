import { Routes } from '@angular/router';

import { NAVIGATION_CATEGORIES } from './navigation-category/navigation-category.data';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home-page.component').then((module) => module.HomePageComponent),
  },
  {
    path: 'heroes',
    loadComponent: () =>
      import('./heroes/heroes-page.component').then((module) => module.HeroesPageComponent),
  },
  {
    path: 'learn',
    redirectTo: 'hero-guides',
    pathMatch: 'full',
  },
  ...NAVIGATION_CATEGORIES.map((category) => ({
    path: category.path.slice(1),
    loadComponent: () =>
      import('./navigation-category/navigation-category-page.component').then(
        (module) => module.NavigationCategoryPageComponent,
      ),
    data: { category },
  })),
  {
    path: 'hero-guides',
    loadComponent: () =>
      import('./hero-guides/hero-guides-page.component').then(
        (module) => module.HeroGuidesPageComponent,
      ),
  },
  {
    path: 'hero-guides/first-time',
    loadComponent: () =>
      import('./hero-guides/first-time-guide-page.component').then(
        (module) => module.FirstTimeGuidePageComponent,
      ),
  },
  {
    path: 'hero-guides/:heroId',
    loadComponent: () =>
      import('./hero-guides/hero-guide-detail-page.component').then(
        (module) => module.HeroGuideDetailPageComponent,
      ),
  },
  {
    path: 'glossary',
    loadComponent: () =>
      import('./glossary/glossary-page.component').then((module) => module.GlossaryPageComponent),
  },
  {
    path: 'techniques',
    loadComponent: () =>
      import('./techniques/techniques-page.component').then(
        (module) => module.TechniquesPageComponent,
      ),
  },
  {
    path: 'beginner-interactive-guide',
    loadComponent: () =>
      import('./beginner-guide/beginner-guide-page.component').then(
        (module) => module.BeginnerGuidePageComponent,
      ),
  },
  {
    path: 'build-theory',
    loadComponent: () =>
      import('./build-theory/build-theory-page.component').then(
        (module) => module.BuildTheoryPageComponent,
      ),
  },
  {
    path: 'triple-support-counter',
    loadComponent: () =>
      import('./triple-support/triple-support-guide-page.component').then(
        (module) => module.TripleSupportGuidePageComponent,
      ),
  },
  {
    path: 'power-positions',
    loadComponent: () =>
      import('./power-positions/power-positions-page.component').then(
        (module) => module.PowerPositionsPageComponent,
      ),
  },
  {
    path: 'strategic-cover',
    loadComponent: () =>
      import('./strategic-cover/strategic-cover-page.component').then(
        (module) => module.StrategicCoverPageComponent,
      ),
  },
  {
    path: 'learning-paths',
    loadComponent: () =>
      import('./learning-paths/learning-paths-page.component').then(
        (module) => module.LearningPathsPageComponent,
      ),
  },
  {
    path: 'media-tutorials',
    loadComponent: () =>
      import('./media-tutorials/media-tutorials-page.component').then(
        (module) => module.MediaTutorialsPageComponent,
      ),
  },
  {
    path: 'user-highlights',
    loadComponent: () =>
      import('./user-highlights/user-highlights-page.component').then(
        (module) => module.UserHighlightsPageComponent,
      ),
  },
  {
    path: 'game-stats',
    loadComponent: () =>
      import('./game-stats/game-stats-page.component').then(
        (module) => module.GameStatsPageComponent,
      ),
  },
  {
    path: 'tier-list',
    loadComponent: () =>
      import('./tier-list/tier-list-page.component').then(
        (module) => module.TierListPageComponent,
      ),
  },
  {
    path: 'season-9-win-rates',
    loadComponent: () =>
      import('./season-9-win-rates/season-9-win-rates-page.component').then(
        (module) => module.Season9WinRatesPageComponent,
      ),
  },
  {
    path: 'watch-next',
    loadComponent: () =>
      import('./watch-next/watch-next-page.component').then(
        (module) => module.WatchNextPageComponent,
      ),
  },
  {
    path: 'counters',
    loadComponent: () =>
      import('./counters/counters-page.component').then((module) => module.CountersPageComponent),
  },
  {
    path: 'team-builder',
    loadComponent: () =>
      import('./team-builder/team-builder-page.component').then(
        (module) => module.TeamBuilderPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'heroes',
  },
];
