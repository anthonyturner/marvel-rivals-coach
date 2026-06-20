import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { HomeContent, NewsItem, PortalCard, QuickLink } from './home-content.model';

interface FandomParseResponse {
  parse?: {
    title?: string;
    wikitext?: {
      '*': string;
    };
  };
}

interface BattlePassSnapshot {
  currentSeason: string;
  battlePass: string;
}

const minimumCurrentSeason = 8;
const fallbackBattlePassSnapshot: BattlePassSnapshot = {
  currentSeason: 'Season 8.5',
  battlePass: 'Project: Heroic Age',
};

@Injectable({ providedIn: 'root' })
export class HomeContentService {
  private readonly http = inject(HttpClient);
  private readonly battlePassSourceUrl = '/api/external-sources/fandom-battlepasses';
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

  /** Loads landing-page content from the cached BattlePass payload stored in the content database. */
  getHomeContent(): Observable<HomeContent> {
    return forkJoin({
      battlePass: this.http.get<FandomParseResponse>(this.battlePassSourceUrl).pipe(
        catchError(() => of({} as FandomParseResponse)),
      ),
      content: this.http.get<Partial<HomeContent>>(this.contentSourceUrl).pipe(
        catchError(() => of({} as Partial<HomeContent>)),
      ),
      portals: this.http.get<PortalCard[]>(this.portalsSourceUrl).pipe(
        catchError(() => of([] as PortalCard[])),
      ),
    }).pipe(
      map(({ battlePass, content, portals }) => {
        const snapshot = this.parseBattlePassSnapshot(battlePass.parse?.wikitext?.['*'] ?? '');
        const databaseContent = {
          ...this.fallbackContent,
          ...content,
          portals,
        };

        return {
          ...databaseContent,
          latestNews: this.withDatabaseBattlePassNews(databaseContent.latestNews, snapshot),
          quickLinks: this.withDatabaseQuickLinks(databaseContent.quickLinks, snapshot),
          lastChecked: new Date().toISOString().slice(0, 10),
          sourceMode: 'database' as const,
        };
      }),
      catchError(() => of(this.fallbackContent)),
    );
  }

  /** Extracts the latest season and BattlePass pair from the Fandom BattlePasses page wikitext. */
  private parseBattlePassSnapshot(wikitext: string): BattlePassSnapshot {
    const seasonBattlePassMatch = wikitext.match(
      /\[\[(Season\s+\d+(?:\.\d+)?(?::\s+[^\]|]+)?)(?:\|[^\]]+)?\]\]\s*-\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/gi,
    );
    const snapshots = (seasonBattlePassMatch ?? [])
      .map((match) => match.match(
        /\[\[(Season\s+\d+(?:\.\d+)?(?::\s+[^\]|]+)?)(?:\|[^\]]+)?\]\]\s*-\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/i,
      ))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => ({
        currentSeason: match[1]?.trim() ?? '',
        battlePass: match[2]?.trim() ?? '',
      }))
      .filter((snapshot) => this.seasonNumber(snapshot.currentSeason) >= minimumCurrentSeason)
      .sort((a, b) => this.seasonNumber(b.currentSeason) - this.seasonNumber(a.currentSeason));

    const parsedSnapshot = snapshots[0];

    return {
      currentSeason: parsedSnapshot?.currentSeason || fallbackBattlePassSnapshot.currentSeason,
      battlePass: parsedSnapshot?.battlePass || fallbackBattlePassSnapshot.battlePass,
    };
  }

  /** Replaces the season and BattlePass quick-link values with the cached database snapshot. */
  private withDatabaseQuickLinks(quickLinks: QuickLink[], snapshot: BattlePassSnapshot): QuickLink[] {
    return quickLinks.map((item) => {
      if (item.label === 'Current Season') {
        return { ...item, value: snapshot.currentSeason };
      }

      if (item.label === 'BattlePass') {
        return { ...item, value: snapshot.battlePass };
      }

      return item;
    });
  }

  /** Updates the Battle Pass news card so it reflects the cached database snapshot. */
  private withDatabaseBattlePassNews(newsItems: NewsItem[], snapshot: BattlePassSnapshot): NewsItem[] {
    return newsItems.map((item) => {
      if (item.label !== 'Battle Pass') {
        return item;
      }

      return {
        ...item,
        title: `${snapshot.battlePass} is the current ${snapshot.currentSeason} BattlePass`,
        description: `The cached Marvel Rivals Wiki BattlePass data currently resolves ${snapshot.currentSeason} to ${snapshot.battlePass}.`,
      };
    });
  }

  private seasonNumber(value: string): number {
    return Number.parseFloat(value.match(/Season\s+(\d+(?:\.\d+)?)/i)?.[1] ?? '0');
  }
}
