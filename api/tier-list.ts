import type { IncomingMessage, ServerResponse } from 'http';

import { getTierListFromDatabase } from '../src/content-database.js';
import { getQueryStringValue, handleJsonRequest } from '../src/vercel-api.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleJsonRequest(req, res, async () => {
    const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'localhost'}`);
    const season = getQueryStringValue(url.searchParams.get('season') ?? undefined);
    const rank = getQueryStringValue(url.searchParams.get('rank') ?? undefined) ?? '5+';
    const seasonId = season ? Number(season) : undefined;

    return await getTierListFromDatabase(Number.isFinite(seasonId) ? seasonId : undefined, rank) ?? null;
  }, { allowCors: true });
}
