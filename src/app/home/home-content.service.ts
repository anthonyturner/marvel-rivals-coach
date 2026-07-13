import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { HomeContent, PortalCard } from './home-content.model';

@Injectable({ providedIn: 'root' })
export class HomeContentService {
  private readonly http = inject(HttpClient);
  private readonly contentSourceUrl = '/api/home/content';
  private readonly portalsSourceUrl = '/api/home/portals';

  readonly fallbackContent: HomeContent = {
    heroStats: [],
    portals: [],
    latestNews: [],
    featuredGuides: [],
    quickLinks: [],
    currentFocusTitle: 'Marvel Rivals Coach',
    currentFocusDescription:
      'Connect the Turso content database to load the latest site content.',
    lastChecked: 'Not loaded',
    sourceMode: 'fallback',
  };

  /** Loads landing-page content from the cached official-site snapshot stored in the content database. */
  getHomeContent(): Observable<HomeContent> {
    return forkJoin({
      content: this.http.get<Partial<HomeContent>>(this.contentSourceUrl).pipe(
        catchError(() => of({} as Partial<HomeContent>)),
      ),
      portals: this.http.get<PortalCard[]>(this.portalsSourceUrl).pipe(
        catchError(() => of([] as PortalCard[])),
      ),
    }).pipe(
      map(({ content, portals }) => {
        const databaseContent = {
          ...this.fallbackContent,
          ...content,
          portals,
        };

        return {
          ...databaseContent,
          lastChecked: new Date().toISOString().slice(0, 10),
          sourceMode: 'database' as const,
        };
      }),
      catchError(() => of(this.fallbackContent)),
    );
  }
}
