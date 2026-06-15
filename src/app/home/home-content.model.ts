export interface HomeStat {
  value: string;
  label: string;
}

export interface PortalCard {
  title: string;
  description: string;
  path: string;
  image: string;
}

export interface NewsItem {
  label: string;
  title: string;
  description: string;
  sourceUrl: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
}

export interface GuideSpotlight {
  title: string;
  description: string;
  path: string;
  tag: string;
}

export interface QuickLink {
  label: string;
  value: string;
}

export interface HomeContent {
  heroStats: HomeStat[];
  portals: PortalCard[];
  latestNews: NewsItem[];
  featuredGuides: GuideSpotlight[];
  quickLinks: QuickLink[];
  currentFocusTitle: string;
  currentFocusDescription: string;
  lastChecked: string;
  sourceMode: 'database' | 'fallback';
}
