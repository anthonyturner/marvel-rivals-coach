import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { HomeContent, NewsItem, QuickLink } from './home-content.model';

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

@Injectable({ providedIn: 'root' })
export class HomeContentService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly battlePassApiUrl =
    'https://marvelrivals.fandom.com/api.php?action=parse&page=BattlePasses&prop=wikitext&format=json&origin=*';

  readonly fallbackContent: HomeContent = {
    heroStats: [
      { value: '9', label: 'Site Sections' },
      { value: '50+', label: 'Hero Entries' },
      { value: '14', label: 'New Glossary Terms' },
    ],
    portals: [
      {
        title: 'Heroes',
        description: 'Browse roles, abilities, strengths, counters, and video searches for the roster.',
        path: '/heroes',
        image: '/images/heroes/phoenix.png',
      },
      {
        title: 'Techniques',
        description: 'Study core fundamentals like cover, high ground, power positions, timing, and lane control.',
        path: '/techniques',
        image: '/images/heroes/doctor-strange.png',
      },
      {
        title: 'Media Tutorials',
        description: 'Watch embedded tutorials and jump into matching transcript guides where available.',
        path: '/media-tutorials',
        image: '/images/heroes/magneto.png',
      },
      {
        title: 'Learning Paths',
        description: 'Follow role-based watch orders and practice drills for focused improvement blocks.',
        path: '/learning-paths',
        image: '/images/heroes/star-lord.png',
      },
      {
        title: 'Watch Next Quiz',
        description: 'Answer three questions and get a recommended watch list plus a matching drill.',
        path: '/watch-next',
        image: '/images/heroes/luna-snow.png',
      },
      {
        title: 'Glossary',
        description: 'Decode coach language: power positions, one-angle rule, cooldown trade, and more.',
        path: '/glossary',
        image: '/images/heroes/rocket-raccoon.png',
      },
    ],
    latestNews: [
      {
        label: 'Season 8.5',
        title: 'Cyclops enters the roster',
        description:
          'The mid-season update is reported to add Cyclops as a Duelist with optic blast pressure, ricochet-style beams, mobility back toward cover, and an ultimate built around removing the visor.',
        sourceUrl:
          'https://timesofindia.indiatimes.com/sports/esports/news/marvel-rivals-season-8-5-release-date-new-hero-game-mode-and-more/articleshow/131622861.cms',
        thumbnailUrl:
          'https://static.toiimg.com/thumb/msid-131622874,imgsize-1511588,width-400,height-225,resizemode-4/marvel-rivals-season-85.jpg',
        thumbnailAlt: 'Marvel Rivals Season 8.5 artwork featuring Cyclops',
      },
      {
        label: 'Battle Pass',
        title: 'Project: Heroic Age is the current Season 8 BattlePass',
        description:
          'The Marvel Rivals Wiki lists Season 8: Sins of Alchemax as current, with the Season 8 BattlePass named Project: Heroic Age.',
        sourceUrl: 'https://marvelrivals.fandom.com/wiki/BattlePasses',
        thumbnailUrl:
          'https://cdn5.idcgames.com/storage/image/1542/season-8-battle-pass-project-heroic-age/default.png',
        thumbnailAlt: 'Project: Heroic Age Season 8 Battle Pass promotional artwork',
      },
      {
        label: 'Mode Update',
        title: "Bounty Annihilation and K'un-Lun Shenloong Arena",
        description:
          "Season 8.5 coverage reports an 18v18 mode and dedicated K'un-Lun Shenloong Arena map arriving with the mid-season patch.",
        sourceUrl:
          'https://timesofindia.indiatimes.com/sports/esports/news/marvel-rivals-season-8-5-release-date-new-hero-game-mode-and-more/articleshow/131622861.cms',
        thumbnailUrl:
          'https://esportsinsider.com/wp-content/uploads/2025/12/Marvel-Rivals-Annihilation-Mode-Guide-large.jpg',
        thumbnailAlt: 'Marvel Rivals 18 versus 18 Annihilation mode artwork',
      },
      {
        label: 'Events',
        title: 'Summer Festival, 616 Day Vault, and Path to Doomsday updates',
        description:
          'Reported mid-season items include a summer event with free Units, a limited 616 Day Vault return, and revised timing for Path to Doomsday phases.',
        sourceUrl:
          'https://timesofindia.indiatimes.com/sports/esports/news/marvel-rivals-season-8-5-release-date-new-hero-game-mode-and-more/articleshow/131622861.cms',
        thumbnailUrl: '/images/heroes/emma-frost.png',
        thumbnailAlt: 'Emma Frost hero artwork used as a Summer Festival thumbnail',
      },
    ],
    featuredGuides: [
      {
        title: 'Strategic Cover Usage',
        description: 'Minimize your hitbox, isolate one angle, scout before peeking, and return to safety after each shot.',
        path: '/strategic-cover',
        tag: 'Transcript Guide',
      },
      {
        title: 'Power Positions',
        description: 'Use map locations that create options, passive pressure, information, and safer objective control.',
        path: '/power-positions',
        tag: 'Transcript Guide',
      },
      {
        title: 'Starter Fundamentals Path',
        description: 'A five-lesson route through cover, high ground, rotations, timing, and target priority.',
        path: '/learning-paths',
        tag: 'Learning Path',
      },
    ],
    quickLinks: [
      { label: 'Current Season', value: 'Season 8: Sins of Alchemax' },
      { label: 'Mid-Season', value: 'Season 8.5' },
      { label: 'BattlePass', value: 'Project: Heroic Age' },
      { label: 'Latest Reported Hero', value: 'Cyclops' },
    ],
    currentFocusTitle: 'Season 8.5 Update',
    currentFocusDescription:
      "Mid-season coverage highlights Cyclops, Bounty Annihilation, K'un-Lun Shenloong Arena, Summer Festival rewards, and the returning 616 Day Vault.",
    lastChecked: '2026-06-14',
    sourceMode: 'fallback',
  };

  /** Loads landing-page content, using live BattlePass data in the browser and fallback data during SSR or failures. */
  getHomeContent(): Observable<HomeContent> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(this.fallbackContent);
    }

    return this.http.get<FandomParseResponse>(this.battlePassApiUrl).pipe(
      map((response) => {
        const snapshot = this.parseBattlePassSnapshot(response.parse?.wikitext?.['*'] ?? '');

        return {
          ...this.fallbackContent,
          latestNews: this.withLiveBattlePassNews(this.fallbackContent.latestNews, snapshot),
          quickLinks: this.withLiveQuickLinks(this.fallbackContent.quickLinks, snapshot),
          lastChecked: new Date().toISOString().slice(0, 10),
          sourceMode: 'live' as const,
        };
      }),
      catchError(() => of(this.fallbackContent)),
    );
  }

  /** Extracts the latest season and BattlePass pair from the Fandom BattlePasses page wikitext. */
  private parseBattlePassSnapshot(wikitext: string): BattlePassSnapshot {
    const seasonBattlePassMatch = wikitext.match(
      /\[\[(Season\s+\d+:\s+[^\]|]+)(?:\|[^\]]+)?\]\]\s*-\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/gi,
    );
    const latestSeasonBattlePass = seasonBattlePassMatch?.at(-1) ?? '';
    const parsedMatch = latestSeasonBattlePass.match(
      /\[\[(Season\s+\d+:\s+[^\]|]+)(?:\|[^\]]+)?\]\]\s*-\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/i,
    );

    return {
      currentSeason: parsedMatch?.[1]?.trim() || 'Season 8: Sins of Alchemax',
      battlePass: parsedMatch?.[2]?.trim() || 'Project: Heroic Age',
    };
  }

  /** Replaces the season and BattlePass quick-link values with the latest live API snapshot. */
  private withLiveQuickLinks(quickLinks: QuickLink[], snapshot: BattlePassSnapshot): QuickLink[] {
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

  /** Updates the Battle Pass news card so it reflects the season and pass found by the live check. */
  private withLiveBattlePassNews(newsItems: NewsItem[], snapshot: BattlePassSnapshot): NewsItem[] {
    return newsItems.map((item) => {
      if (item.label !== 'Battle Pass') {
        return item;
      }

      return {
        ...item,
        title: `${snapshot.battlePass} is the current ${snapshot.currentSeason} BattlePass`,
        description: `The Marvel Rivals Wiki BattlePass API currently resolves ${snapshot.currentSeason} to ${snapshot.battlePass}.`,
      };
    });
  }
}
