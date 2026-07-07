import { Routes } from '@angular/router';

import { BeginnerGuidePageComponent } from './beginner-guide/beginner-guide-page.component';
import { BuildTheoryPageComponent } from './build-theory/build-theory-page.component';
import { CountersPageComponent } from './counters/counters-page.component';
import { GameStatsPageComponent } from './game-stats/game-stats-page.component';
import { FirstTimeGuidePageComponent } from './hero-guides/first-time-guide-page.component';
import { HeroGuideDetailPageComponent } from './hero-guides/hero-guide-detail-page.component';
import { GlossaryPageComponent } from './glossary/glossary-page.component';
import { HeroGuidesPageComponent } from './hero-guides/hero-guides-page.component';
import { HeroesPageComponent } from './heroes/heroes-page.component';
import { HomePageComponent } from './home/home-page.component';
import { LearningPathsPageComponent } from './learning-paths/learning-paths-page.component';
import { MediaTutorialsPageComponent } from './media-tutorials/media-tutorials-page.component';
import { NAVIGATION_CATEGORIES, NavigationCategoryPageComponent } from './navigation-category/navigation-category-page.component';
import { PowerPositionsPageComponent } from './power-positions/power-positions-page.component';
import { StrategicCoverPageComponent } from './strategic-cover/strategic-cover-page.component';
import { TeamBuilderPageComponent } from './team-builder/team-builder-page.component';
import { TechniquesPageComponent } from './techniques/techniques-page.component';
import { WatchNextPageComponent } from './watch-next/watch-next-page.component';
import { TierListPageComponent } from './tier-list/tier-list-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'heroes',
    component: HeroesPageComponent,
  },
  {
    path: 'learn',
    component: NavigationCategoryPageComponent,
    data: { category: NAVIGATION_CATEGORIES[0] },
  },
  {
    path: 'resources',
    component: NavigationCategoryPageComponent,
    data: { category: NAVIGATION_CATEGORIES[1] },
  },
  {
    path: 'tools',
    component: NavigationCategoryPageComponent,
    data: { category: NAVIGATION_CATEGORIES[2] },
  },
  {
    path: 'hero-guides',
    component: HeroGuidesPageComponent,
  },
  {
    path: 'hero-guides/first-time',
    component: FirstTimeGuidePageComponent,
  },
  {
    path: 'hero-guides/:heroId',
    component: HeroGuideDetailPageComponent,
  },
  {
    path: 'glossary',
    component: GlossaryPageComponent,
  },
  {
    path: 'techniques',
    component: TechniquesPageComponent,
  },
  {
    path: 'beginner-interactive-guide',
    component: BeginnerGuidePageComponent,
  },
  {
    path: 'build-theory',
    component: BuildTheoryPageComponent,
  },
  {
    path: 'power-positions',
    component: PowerPositionsPageComponent,
  },
  {
    path: 'strategic-cover',
    component: StrategicCoverPageComponent,
  },
  {
    path: 'learning-paths',
    component: LearningPathsPageComponent,
  },
  {
    path: 'media-tutorials',
    component: MediaTutorialsPageComponent,
  },
  {
    path: 'game-stats',
    component: GameStatsPageComponent,
  },
  {
    path: 'tier-list',
    component: TierListPageComponent,
  },
  {
    path: 'watch-next',
    component: WatchNextPageComponent,
  },
  {
    path: 'counters',
    component: CountersPageComponent,
  },
  {
    path: 'team-builder',
    component: TeamBuilderPageComponent,
  },
  {
    path: '**',
    redirectTo: 'heroes',
  },
];
