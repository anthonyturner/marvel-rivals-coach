import { createClient } from '@tursodatabase/serverless/compat';

type SteamNewsItem = {
  title?: string;
  url?: string;
  contents?: string;
  date?: number;
  feedlabel?: string;
};

type SteamNewsResponse = {
  appnews?: {
    newsitems?: SteamNewsItem[];
  };
};

type FandomParseResponse = {
  parse?: {
    wikitext?: {
      '*': string;
    };
  };
};

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
};

type BattlePassSnapshot = {
  currentSeason: string;
  battlePass: string;
};

export type HomeNewsSyncResult = {
  updatedAt: string;
  latestNews: NewsItem[];
  battlePass: BattlePassSnapshot;
  steamItemsRead: number;
};

const steamNewsSource = {
  key: 'steam-marvel-rivals-news',
  name: 'Steam Marvel Rivals News',
  url: 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2767030&count=8&maxlength=1200&format=json',
};

const battlePassSource = {
  key: 'fandom-battlepasses',
  name: 'Marvel Rivals Fandom BattlePasses',
  url: 'https://marvelrivals.fandom.com/api.php?action=parse&page=BattlePasses&prop=wikitext&format=json&origin=*',
};

const minimumCurrentSeason = 8;
const fallbackBattlePassSnapshot: BattlePassSnapshot = {
  currentSeason: 'Season 8.5',
  battlePass: 'Project: Heroic Age',
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
    const [steamNews, battlePass] = await Promise.all([
      fetchJson<SteamNewsResponse>(steamNewsSource.url),
      fetchJson<FandomParseResponse>(battlePassSource.url),
    ]);
    const fetchedAt = new Date().toISOString();
    const battlePassSnapshot = parseBattlePassSnapshot(
      battlePass.parse?.wikitext?.['*'] ?? '',
    );
    const latestNews = buildLatestNewsCards(
      steamNews.appnews?.newsitems ?? [],
      battlePassSnapshot,
    );

    await Promise.all([
      upsertExternalSource(db, steamNewsSource, steamNews, fetchedAt, 'success', null),
      upsertExternalSource(db, battlePassSource, battlePass, fetchedAt, 'success', null),
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
      steamItemsRead: steamNews.appnews?.newsitems?.length ?? 0,
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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'marvel-rivals-coach-content-sync/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: HTTP ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function buildLatestNewsCards(
  steamItems: SteamNewsItem[],
  battlePass: BattlePassSnapshot,
): NewsItem[] {
  const battlePassCard: NewsItem = {
    label: 'Battle Pass',
    title: `${battlePass.battlePass} is the current ${battlePass.currentSeason} BattlePass`,
    description: `${battlePass.currentSeason} BattlePass coverage is refreshed from the cached wiki source, while the surrounding news cards come from the official Steam news feed.`,
    sourceUrl: 'https://marvelrivals.fandom.com/wiki/BattlePasses',
    thumbnailUrl: fallbackThumbnail,
    thumbnailAlt: `${battlePass.battlePass} BattlePass artwork`,
  };
  const steamCards = steamItems
    .filter((item) => Boolean(item.title && item.url))
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    .slice(0, 3)
    .map((item) => ({
      label: labelForNews(item),
      title: item.title?.trim() ?? 'Marvel Rivals Update',
      description: summarizeNews(item.contents ?? ''),
      sourceUrl: item.url ?? 'https://store.steampowered.com/news/app/2767030',
      thumbnailUrl: firstImageFromContents(item.contents ?? '') ?? fallbackThumbnail,
      thumbnailAlt: `${item.title?.trim() ?? 'Marvel Rivals update'} thumbnail`,
    }));

  return [battlePassCard, ...steamCards];
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
        { label: 'BattlePass', value: battlePass.battlePass },
      ];

  return quickLinks.map((item) => {
    if (item.label === 'Current Season') {
      return { ...item, value: battlePass.currentSeason };
    }

    if (item.label === 'BattlePass') {
      return { ...item, value: battlePass.battlePass };
    }

    return item;
  });
}

function parseBattlePassSnapshot(wikitext: string): BattlePassSnapshot {
  const seasonBattlePassMatch = wikitext.match(
    /\[\[(Season\s+\d+(?:\.\d+)?(?::\s+[^\]|]+)?)(?:\|[^\]]+)?\]\]\s*-\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/gi,
  );
  const snapshots = (seasonBattlePassMatch ?? [])
    .map((match) =>
      match.match(
        /\[\[(Season\s+\d+(?:\.\d+)?(?::\s+[^\]|]+)?)(?:\|[^\]]+)?\]\]\s*-\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/i,
      ),
    )
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      currentSeason: match[1]?.trim() ?? '',
      battlePass: match[2]?.trim() ?? '',
    }))
    .filter((snapshot) => seasonNumber(snapshot.currentSeason) >= minimumCurrentSeason)
    .sort((a, b) => seasonNumber(b.currentSeason) - seasonNumber(a.currentSeason));

  return snapshots[0] ?? fallbackBattlePassSnapshot;
}

function labelForNews(item: SteamNewsItem): string {
  const text = `${item.feedlabel ?? ''} ${item.title ?? ''}`.toLowerCase();

  if (text.includes('patch') || text.includes('version')) {
    return 'Patch Notes';
  }

  if (text.includes('event')) {
    return 'Event';
  }

  if (text.includes('season')) {
    return 'Season Update';
  }

  return item.feedlabel?.trim() || 'Official News';
}

function summarizeNews(contents: string): string {
  const clean = contents
    .replace(/\{STEAM_CLAN_IMAGE\}\/\S+/g, ' ')
    .replace(/\[\/?[^}\]]+\]/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) {
    return 'Read the latest official Marvel Rivals announcement on Steam.';
  }

  return clean.length > 220 ? `${clean.slice(0, 217).trim()}...` : clean;
}

function firstImageFromContents(contents: string): string | undefined {
  const steamImage = contents.match(/\{STEAM_CLAN_IMAGE\}\/([^\s\]]+)/i)?.[1];

  if (steamImage) {
    return `https://clan.akamai.steamstatic.com/images/${steamImage}`;
  }

  return contents.match(/https?:\/\/[^\s\]]+\.(?:jpg|jpeg|png|webp)/i)?.[0];
}

function focusTitle(newsItems: NewsItem[]): string {
  return newsItems.find((item) => item.label !== 'Battle Pass')?.title ?? 'Latest Marvel Rivals News';
}

function focusDescription(newsItems: NewsItem[]): string {
  const lead = newsItems.find((item) => item.label !== 'Battle Pass');

  return lead?.description ?? 'Latest news is refreshed from the official Steam feed and cached in Turso.';
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

function seasonNumber(value: string): number {
  return Number.parseFloat(value.match(/Season\s+(\d+(?:\.\d+)?)/i)?.[1] ?? '0');
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Set ${name} before syncing home news.`);
  }

  return value;
}
