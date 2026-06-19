import { Routes } from '@angular/router';

import { BuildTheoryPageComponent } from './build-theory/build-theory-page.component';
import { GameStatsPageComponent } from './game-stats/game-stats-page.component';
import { HeroGuideDetailPageComponent } from './hero-guides/hero-guide-detail-page.component';
import { GlossaryPageComponent } from './glossary/glossary-page.component';
import { HeroGuidesPageComponent } from './hero-guides/hero-guides-page.component';
import { HeroesPageComponent } from './heroes/heroes-page.component';
import { HomePageComponent } from './home/home-page.component';
import { LearningPathsPageComponent } from './learning-paths/learning-paths-page.component';
import { MediaTutorialsPageComponent } from './media-tutorials/media-tutorials-page.component';
import { PowerPositionsPageComponent } from './power-positions/power-positions-page.component';
import { StrategicCoverPageComponent } from './strategic-cover/strategic-cover-page.component';
import { TeamBuilderPageComponent } from './team-builder/team-builder-page.component';
import { TechniquesPageComponent } from './techniques/techniques-page.component';
import { WatchNextPageComponent } from './watch-next/watch-next-page.component';

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
    path: 'hero-guides',
    component: HeroGuidesPageComponent,
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
    path: 'watch-next',
    component: WatchNextPageComponent,
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
