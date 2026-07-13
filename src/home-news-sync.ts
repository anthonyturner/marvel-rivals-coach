import { createClient } from '@tursodatabase/serverless/compat';

type NewsItem = {
  label: string;
  title: string;
  description: string;
  sourceUrl: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
};

type QuickLink = {
  label: string;
  value: string;
  imageUrl?: string;
};

type BattlePassSnapshot = {
  currentSeason: string;
  battlePass: string;
  seasonStory?: string;
  latestHero?: string;
  latestHeroImageUrl?: string;
};

export type HomeNewsSyncResult = {
  updatedAt: string;
  latestNews: NewsItem[];
  battlePass: BattlePassSnapshot;
  steamItemsRead: number;
};

const officialHomeSource = {
  key: 'official-marvel-rivals-home',
  name: 'Official Marvel Rivals Home',
  url: 'https://www.marvelrivals.com/index.html',
};

const fallbackBattlePassSnapshot: BattlePassSnapshot = {
  currentSeason: 'Season 9',
  battlePass: 'The Mystery of Thebes',
  seasonStory: 'The Mystery of Thebes',
  latestHero: 'Jubilee',
  latestHeroImageUrl: '/images/heroes/jubilee.png',
};
const fallbackThumbnail = '/images/site/heroes-banner.jpg';

const nodeProcess = process as typeof process & {
  loadEnvFile?: (path?: string) => void;
};

try {
  nodeProcess.loadEnvFile?.('.env');
} catch {
  // Vercel and CI provide environment variables directly.
}

export async function syncHomeNews(): Promise<HomeNewsSyncResult> {
  const db = createClient({
    url: requireEnv('TURSO_DATABASE_URL'),
    authToken: requireEnv('TURSO_AUTH_TOKEN'),
  });
  const startedAt = new Date().toISOString();
  const runId = await insertSyncRun(db, 'home-news', startedAt);

  try {
    const officialHomeHtml = await fetchText(officialHomeSource.url);
    const fetchedAt = new Date().toISOString();
    const officialSnapshot = parseOfficialHomeSnapshot(officialHomeHtml);
    const battlePassSnapshot = officialSnapshot.battlePass;
    const latestNews = buildLatestNewsCards(officialSnapshot.news, battlePassSnapshot);

    await Promise.all([
      upsertExternalSource(db, officialHomeSource, officialSnapshot, fetchedAt, 'success', null),
      upsertContentBlock(db, 'latestNews', latestNews, fetchedAt),
      upsertContentBlock(db, 'quickLinks', await buildQuickLinks(db, battlePassSnapshot), fetchedAt),
      upsertContentBlock(db, 'currentFocusTitle', focusTitle(latestNews), fetchedAt),
      upsertContentBlock(db, 'currentFocusDescription', focusDescription(latestNews), fetchedAt),
      upsertContentBlock(db, 'lastChecked', fetchedAt.slice(0, 10), fetchedAt),
    ]);

    await finishSyncRun(db, runId, 'success', `Synced ${latestNews.length} home news cards`, fetchedAt);

    return {
      updatedAt: fetchedAt,
      latestNews,
      battlePass: battlePassSnapshot,
      steamItemsRead: officialSnapshot.news.length,
    };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);

    await finishSyncRun(db, runId, 'error', message, finishedAt);
    throw error;
  } finally {
    db.close();
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'marvel-rivals-coach-content-sync/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: HTTP ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function buildLatestNewsCards(
  officialNews: NewsItem[],
  battlePass: BattlePassSnapshot,
): NewsItem[] {
  const seasonCard = officialNews.find((item) => item.title.includes(battlePass.currentSeason));
  const cards = seasonCard
    ? [seasonCard, ...officialNews.filter((item) => item !== seasonCard)]
    : officialNews;

  return cards.slice(0, 4);
}

async function buildQuickLinks(
  db: ReturnType<typeof createClient>,
  battlePass: BattlePassSnapshot,
): Promise<QuickLink[]> {
  const existing = await getContentBlock<QuickLink[]>(db, 'quickLinks');
  const quickLinks = existing?.length
    ? existing
    : [
        { label: 'Current Season', value: battlePass.currentSeason },
        { label: 'Season Story', value: battlePass.seasonStory ?? battlePass.battlePass },
        {
          label: 'Latest Hero',
          value: battlePass.latestHero ?? 'Jubilee',
          imageUrl: battlePass.latestHeroImageUrl,
        },
      ];
  const normalizedLinks = [
    { label: 'Current Season', value: battlePass.currentSeason },
    { label: 'Season Story', value: battlePass.seasonStory ?? battlePass.battlePass },
    {
      label: 'Latest Hero',
      value: battlePass.latestHero ?? 'Jubilee',
      imageUrl: battlePass.latestHeroImageUrl,
    },
    ...quickLinks.filter((item) =>
      !['Current Season', 'Mid-Season', 'BattlePass', 'Season Story', 'Latest Hero', 'Latest Reported Hero'].includes(item.label),
    ),
  ];

  return normalizedLinks.map((item) => {
    if (item.label === 'Current Season') {
      return { ...item, value: battlePass.currentSeason };
    }

    if (item.label === 'BattlePass') {
      return { ...item, value: battlePass.battlePass };
    }

    if (item.label === 'Season Story') {
      return { ...item, value: battlePass.seasonStory ?? battlePass.battlePass };
    }

    if (item.label === 'Latest Hero' || item.label === 'Latest Reported Hero') {
      return {
        ...item,
        label: 'Latest Hero',
        value: battlePass.latestHero ?? 'Jubilee',
        imageUrl: battlePass.latestHeroImageUrl,
      };
    }

    return item;
  });
}

function parseOfficialHomeSnapshot(html: string): { news: NewsItem[]; battlePass: BattlePassSnapshot } {
  const news = parseOfficialNewsCards(html);
  const seasonNews = news.find((item) => /Season\s+\d+/i.test(item.title));
  const seasonTitle = seasonNews?.title.match(/(Season\s+\d+(?:\.\d+)?)(?::\s*([^/]+?))?(?:\s*\/\/|$)/i);
  const currentSeason = seasonTitle?.[1]?.trim() ?? fallbackBattlePassSnapshot.currentSeason;
  const seasonStory = seasonTitle?.[2]?.trim() ?? fallbackBattlePassSnapshot.seasonStory;
  const latestHero = parseLatestOfficialHero(html);

  return {
    news,
    battlePass: {
      currentSeason,
      battlePass: seasonStory ?? currentSeason,
      seasonStory,
      latestHero: latestHero?.name ?? fallbackBattlePassSnapshot.latestHero,
      latestHeroImageUrl: latestHero?.imageUrl ?? fallbackBattlePassSnapshot.latestHeroImageUrl,
    },
  };
}

function parseOfficialNewsCards(html: string): NewsItem[] {
  const banner = html.match(/<div class="banner">([\s\S]*?)<\/div>\s*<div class="list">/i)?.[1] ?? '';
  const cards: NewsItem[] = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(banner))) {
    const attrs = parseAttributes(match[1]);
    const body = match[2];
    const title = cleanText(extractByClass(body, 'title'));
    const description = cleanText(extractByClass(body, 'desc'));

    if (!title) {
      continue;
    }

    cards.push({
      label: labelForOfficialNews(title),
      title,
      description: description || 'Read the latest official Marvel Rivals announcement.',
      sourceUrl: absoluteUrl(attrs['href'] ?? officialHomeSource.url),
      thumbnailUrl: firstImage(body) ?? fallbackThumbnail,
      thumbnailAlt: `${title} thumbnail`,
    });
  }

  return cards.length > 0 ? cards : [{
    label: 'Season Update',
    title: 'Season 9: The Mystery of Thebes',
    description: 'Official Marvel Rivals Season 9 coverage is available on the Marvel Rivals site.',
    sourceUrl: officialHomeSource.url,
    thumbnailUrl: fallbackThumbnail,
    thumbnailAlt: 'Marvel Rivals Season 9 thumbnail',
  }];
}

function parseLatestOfficialHero(html: string): { name: string; imageUrl?: string } | undefined {
  const heroMatch = html.match(/<div class="heroNewsList">\s*<a\b([^>]*)>([\s\S]*?)<\/a>/i);

  if (!heroMatch) {
    return undefined;
  }

  const attrs = parseAttributes(heroMatch[1]);
  const name = titleCaseName(attrs['data-name'] ?? attrs['title']);

  return {
    name,
    imageUrl: firstImage(heroMatch[2]) ?? `/images/heroes/${slugifyHeroName(name)}.png`,
  };
}

function labelForOfficialNews(title: string): string {
  const text = title.toLowerCase();

  if (text.includes('balance')) {
    return 'Balance Update';
  }

  if (text.includes('patch') || text.includes('version')) {
    return 'Patch Notes';
  }

  if (text.includes('season')) {
    return 'Season Update';
  }

  return 'Official News';
}

function focusTitle(newsItems: NewsItem[]): string {
  return newsItems.find((item) => item.label !== 'Battle Pass')?.title ?? 'Latest Marvel Rivals News';
}

function focusDescription(newsItems: NewsItem[]): string {
  const lead = newsItems.find((item) => item.label !== 'Battle Pass');

  return lead?.description ?? 'Latest news is refreshed from the official Marvel Rivals site and cached in Turso.';
}

async function getContentBlock<T>(
  db: ReturnType<typeof createClient>,
  contentKey: string,
): Promise<T | undefined> {
  const result = await db.execute(
    'SELECT payload_json FROM home_content_blocks WHERE content_key = ?',
    [contentKey],
  );
  const row = result.rows[0] as { payload_json?: string } | undefined;

  return row?.payload_json ? JSON.parse(row.payload_json) as T : undefined;
}

async function upsertContentBlock(
  db: ReturnType<typeof createClient>,
  contentKey: string,
  payload: unknown,
  updatedAt: string,
): Promise<void> {
  await db.execute(
    `INSERT INTO home_content_blocks (content_key, payload_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(content_key) DO UPDATE SET
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at`,
    [contentKey, JSON.stringify(payload), updatedAt],
  );
}

async function upsertExternalSource(
  db: ReturnType<typeof createClient>,
  source: { key: string; name: string; url: string },
  payload: unknown,
  fetchedAt: string,
  status: string,
  error: string | null,
): Promise<void> {
  await db.execute(
    `INSERT INTO external_sources (
      source_key, source_name, url, payload_json, fetched_at, status, error
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_key) DO UPDATE SET
      source_name = excluded.source_name,
      url = excluded.url,
      payload_json = excluded.payload_json,
      fetched_at = excluded.fetched_at,
      status = excluded.status,
      error = excluded.error`,
    [source.key, source.name, source.url, JSON.stringify(payload), fetchedAt, status, error],
  );
}

async function insertSyncRun(
  db: ReturnType<typeof createClient>,
  sourceKey: string,
  startedAt: string,
): Promise<number> {
  const result = await db.execute(
    `INSERT INTO sync_runs (source_key, status, message, started_at)
    VALUES (?, ?, ?, ?)`,
    [sourceKey, 'running', 'Refreshing home news content', startedAt],
  );

  return Number(result.lastInsertRowid);
}

async function finishSyncRun(
  db: ReturnType<typeof createClient>,
  runId: number,
  status: string,
  message: string,
  finishedAt: string,
): Promise<void> {
  await db.execute(
    `UPDATE sync_runs
    SET status = ?, message = ?, finished_at = ?
    WHERE id = ?`,
    [status, message, finishedAt, runId],
  );
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Set ${name} before syncing home news.`);
  }

  return value;
}

function extractByClass(html: string, className: string): string {
  const match = html.match(new RegExp(`<[^>]*class="${className}"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i'));

  return match?.[1] ?? '';
}

function firstImage(html: string): string | undefined {
  const match = html.match(/<img\b[^>]*\bsrc="([^"]+)"/i);

  return match ? absoluteUrl(decodeHtml(match[1])) : undefined;
}

function parseAttributes(value: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(value))) {
    attrs[match[1]] = decodeHtml(match[2]);
  }

  return attrs;
}

function absoluteUrl(value: string): string {
  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (value.startsWith('/')) {
    return `https://www.marvelrivals.com${value}`;
  }

  return value;
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function titleCaseName(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .split(/(\s+|-|&)/)
    .map((part) => /^[a-z]/.test(part) ? part[0].toUpperCase() + part.slice(1) : part)
    .join('')
    .replace(/\bAnd\b/g, '&');
}

function slugifyHeroName(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
