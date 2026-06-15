import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  getContentStatusFromDatabase,
  getExternalSourceFromDatabase,
  getGlossaryTermsFromDatabase,
  getHeroFromDatabase,
  getHeroVideosFromDatabase,
  getHeroesFromDatabase,
  getHomeContentBlocksFromDatabase,
  getHomePortalsFromDatabase,
} from '../src/content-database';

type VercelRequest = IncomingMessage & {
  query?: {
    path?: string | string[];
  };
};

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 's-maxage=300, stale-while-revalidate=3600',
};

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method && req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const route = normalizePath(req.query?.path);

  try {
    if (route === 'content/status') {
      sendJson(res, 200, await getContentStatusFromDatabase());
      return;
    }

    if (route === 'heroes') {
      sendJson(res, 200, await getHeroesFromDatabase());
      return;
    }

    if (route.startsWith('heroes/')) {
      const heroId = decodeURIComponent(route.slice('heroes/'.length));
      const hero = await getHeroFromDatabase(heroId);
      sendJson(res, hero ? 200 : 404, hero ?? { error: 'Hero not found' });
      return;
    }

    if (route === 'hero-videos') {
      sendJson(res, 200, await getHeroVideosFromDatabase());
      return;
    }

    if (route === 'home/portals') {
      sendJson(res, 200, await getHomePortalsFromDatabase());
      return;
    }

    if (route === 'home/content') {
      sendJson(res, 200, await getHomeContentBlocksFromDatabase());
      return;
    }

    if (route === 'glossary') {
      sendJson(res, 200, await getGlossaryTermsFromDatabase());
      return;
    }

    if (route.startsWith('external-sources/')) {
      const sourceKey = decodeURIComponent(route.slice('external-sources/'.length));
      const source = await getExternalSourceFromDatabase(sourceKey);
      sendJson(res, source ? 200 : 404, source ?? { error: 'External source not found' });
      return;
    }

    sendJson(res, 404, { error: 'API route not found' });
  } catch (error) {
    console.error(`Vercel API failed for /api/${route}`, error);
    sendJson(res, 500, { error: 'Failed to load content data' });
  }
}

function normalizePath(path: string | string[] | undefined): string {
  if (Array.isArray(path)) {
    return path.join('/');
  }

  return path ?? '';
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(body));
}
