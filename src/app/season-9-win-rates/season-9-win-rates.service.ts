import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';

import type { Season9ReportPayload } from './season-9-win-rates.data';

interface Season9ExternalSourcePayload extends Season9ReportPayload {
  season: number;
  week: number;
  sourceUrl: string;
}

@Injectable({ providedIn: 'root' })
export class Season9WinRatesService {
  private readonly http = inject(HttpClient);
  private readonly report$ = this.http
    .get<Season9ExternalSourcePayload>('/api/external-sources/nerfpool-s9-week1')
    .pipe(
      map((payload) => ({
        heroInsights: payload.heroInsights,
        metaQuadrants: payload.metaQuadrants,
        roleLadder: payload.roleLadder,
        oneTricks: payload.oneTricks,
      })),
      catchError((error) => {
        console.error('Failed to load the Season 9 win-rate report from the content database', error);
        return of(null);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  getReport(): Observable<Season9ReportPayload | null> {
    return this.report$;
  }
}
